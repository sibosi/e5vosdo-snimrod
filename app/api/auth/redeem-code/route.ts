import { getSessionCookieOptions, SESSION_COOKIE_NAME } from "@/auth";
import { withConnection } from "@/db/db";
import { createHash } from "crypto";
import { encode } from "next-auth/jwt";
import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 5;
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

async function getClientIp() {
  const requestHeaders = await headers();
  return (
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    requestHeaders.get("x-real-ip") ??
    "unknown"
  );
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const current = rateLimit.get(ip);
  if (!current || current.resetAt <= now) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > RATE_LIMIT_MAX;
}

export async function POST(request: NextRequest) {
  const ip = await getClientIp();
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Túl sok próbálkozás. Próbáld újra egy perc múlva." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
  if (!/^[A-Z2-9]{8}$/.test(code)) {
    return NextResponse.json({ error: "Érvénytelen kód." }, { status: 400 });
  }

  const result = await withConnection(async (connection) => {
    await connection.beginTransaction();
    try {
      const [rows] = await connection.execute(
        "SELECT email, expires_at, used_at FROM one_time_login_codes WHERE code = ? FOR UPDATE",
        [hashCode(code)],
      );
      const loginCode = (rows as { email: string; expires_at: Date; used_at: Date | null }[])[0];
      if (!loginCode) {
        await connection.rollback();
        return { error: "Érvénytelen kód.", status: 400 };
      }
      if (loginCode.used_at) {
        await connection.rollback();
        return { error: "Ez a kód már fel lett használva.", status: 400 };
      }
      if (new Date(loginCode.expires_at).getTime() <= Date.now()) {
        await connection.rollback();
        return { error: "A kód lejárt.", status: 400 };
      }

      await connection.execute(
        "UPDATE one_time_login_codes SET used_at = CURRENT_TIMESTAMP WHERE code = ? AND used_at IS NULL",
        [hashCode(code)],
      );
      await connection.commit();
      return { email: loginCode.email };
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "A bejelentkezés konfigurációs hibába ütközött." }, { status: 500 });
  }

  const token = await encode({
    token: { sub: result.email, email: result.email },
    secret,
    salt: SESSION_COOKIE_NAME,
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
  return NextResponse.json({ success: true });
}