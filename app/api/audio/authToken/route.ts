import { sign } from "jsonwebtoken";
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET ?? "secure_audio_stream_secret";

export const sessions: Record<string, { userId: string; expires: number }> = {};

type ResponseData = {
  token: string;
  sessionId: string;
};

function generateSessionId(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function POST(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | { error: string }>,
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const userId =
    req.body.userId || "user-" + Math.random().toString(36).substring(2, 9);

  const sessionId = generateSessionId();

  const expires = Date.now() + 3600000;
  sessions[sessionId] = { userId, expires };

  const token = sign(
    {
      userId,
      sessionId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(expires / 1000),
    },
    JWT_SECRET,
  );

  return NextResponse.json({ token, sessionId });
}
