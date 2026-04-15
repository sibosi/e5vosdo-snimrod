// lib/bimunAuth.ts
// Közös szalagavató autentikációs logika

import crypto from "node:crypto";

export const BIMUN_COOKIE_NAME = "bimun_auth";

// Cookie 30 napig érvényes
export const BIMUN_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

// Titkos kulcs a token generáláshoz - env-ből vagy fallback
const SECRET_KEY = process.env.BIMUN_SECRET!;

if (!SECRET_KEY)
  throw new Error(
    "BIMUN_SECRET környezeti változó nincs beállítva a bimun autentikációhoz",
  );

/**
 * Generál egy HMAC-SHA256 alapú tokent
 * A token tartalmazza a lejárati időt is, így nem lehet régi tokenekkel visszaélni
 */
export function generateBimunToken(): string {
  const expiresAt = Date.now() + BIMUN_COOKIE_MAX_AGE * 1000;
  const payload = `bimun:${expiresAt}`;
  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(payload)
    .digest("hex");
  return `${expiresAt}:${signature}`;
}

/**
 * Ellenőrzi a token érvényességét
 */
export function verifyBimunToken(token: string): boolean {
  if (!token) return false;

  const parts = token.split(":");
  if (parts.length !== 2) return false;

  const [expiresAtStr, signature] = parts;
  const expiresAt = Number.parseInt(expiresAtStr, 10);

  // Lejárt-e?
  if (Number.isNaN(expiresAt) || Date.now() > expiresAt) {
    return false;
  }

  // Ellenőrizzük az aláírást
  const payload = `bimun:${expiresAt}`;
  const expectedSignature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(payload)
    .digest("hex");

  // Timing-safe összehasonlítás a timing attackok ellen
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  } catch {
    return false;
  }
}
