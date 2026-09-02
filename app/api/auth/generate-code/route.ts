import { auth } from "@/auth";
import { dbreq } from "@/db/db";
import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;
const CODE_LIFETIME_MS = 5 * 60 * 1000;

function createCode() {
  const bytes = randomBytes(CODE_LENGTH);
  return Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("");
}

function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export async function POST() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "Bejelentkezés szükséges." }, { status: 401 });
  }

  const code = createCode();
  const expiresAt = new Date(Date.now() + CODE_LIFETIME_MS);

  await dbreq("UPDATE one_time_login_codes SET used_at = CURRENT_TIMESTAMP WHERE email = ? AND used_at IS NULL", [email]);
  await dbreq(
    "INSERT INTO one_time_login_codes (code, email, expires_at) VALUES (?, ?, ?)",
    [hashCode(code), email, expiresAt],
  );

  return NextResponse.json({ code, expiresAt: expiresAt.toISOString() });
}