import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.AUTH_SECRET || "fallback-secret";
const TOKEN_EXPIRY = "1h";

export interface ImageTokenPayload {
  email: string;
  iat?: number;
  exp?: number;
}

export function generateImageToken(email: string): string {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyImageToken(token: string): ImageTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as ImageTokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
