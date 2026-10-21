import { auth } from "@/auth";
import { dbreq } from "@/db/db";
import { getAuth, getUser } from "@/db/dbreq";
import { hasPermission } from "@/db/permissions";
import { isValidEmailAddress } from "@/lib/emailValidation";
import { createHmac, randomBytes } from "crypto";
import { NextResponse } from "next/server";

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;
const DEFAULT_CODE_LIFETIME_MS = 5 * 60 * 1000;

function createCode() {
  const bytes = randomBytes(CODE_LENGTH);
  return Array.from(
    bytes,
    (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length],
  ).join("");
}

const CODE_HASH_SECRET = process.env.OTP_HASH_SECRET ?? process.env.AUTH_SECRET;

function hashCode(code: string) {
  if (!CODE_HASH_SECRET) return null;
  return createHmac("sha256", CODE_HASH_SECRET).update(code).digest("hex");
}

export async function POST(request: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json(
      { error: "Bejelentkezés szükséges." },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const requestedEmail =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const requestedDays = body?.days;
  let targetEmail = email;
  let lifetimeMs = DEFAULT_CODE_LIFETIME_MS;

  if (requestedEmail || requestedDays !== undefined) {
    const adminUser = await getAuth();
    if (!hasPermission(adminUser, "admin")) {
      return NextResponse.json(
        { error: "Admin jogosultság szükséges." },
        { status: 403 },
      );
    }
    if (!isValidEmailAddress(requestedEmail)) {
      return NextResponse.json(
        { error: "Érvényes cél-email cím szükséges." },
        { status: 400 },
      );
    }
    if (
      !Number.isInteger(requestedDays) ||
      requestedDays < 1 ||
      requestedDays > 7
    ) {
      return NextResponse.json(
        { error: "A lejárat 1 és 7 nap között lehet." },
        { status: 400 },
      );
    }
    if (!(await getUser(requestedEmail))) {
      return NextResponse.json(
        { error: "A célfelhasználó nem található." },
        { status: 404 },
      );
    }
    targetEmail = requestedEmail;
    lifetimeMs = requestedDays * 24 * 60 * 60 * 1000;
  }

  const code = createCode();
  const codeHash = hashCode(code);
  if (!codeHash) {
    return NextResponse.json(
      { error: "A bejelentkezés konfigurációs hibába ütközött." },
      { status: 500 },
    );
  }
  const expiresAt = new Date(Date.now() + lifetimeMs);

  await dbreq(
    "UPDATE one_time_login_codes SET used_at = CURRENT_TIMESTAMP WHERE email = ? AND used_at IS NULL",
    [targetEmail],
  );
  await dbreq(
    "INSERT INTO one_time_login_codes (code_hash, email, expires_at) VALUES (?, ?, ?)",
    [codeHash, targetEmail, expiresAt],
  );

  return NextResponse.json({ code, expiresAt: expiresAt.toISOString() });
}
