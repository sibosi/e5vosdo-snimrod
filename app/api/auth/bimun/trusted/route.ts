import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  BIMUN_COOKIE_NAME,
  BIMUN_COOKIE_MAX_AGE,
  generateBimunToken,
  verifyBimunTrustedToken,
} from "@/lib/bimunAuth";

export async function GET(req: NextRequest) {
  const trustedToken = req.nextUrl.searchParams.get("token");

  if (verifyBimunTrustedToken(trustedToken ?? undefined)) {
    const token = generateBimunToken();
    const cookieStore = await cookies();

    cookieStore.set(BIMUN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: BIMUN_COOKIE_MAX_AGE,
      path: "/",
    });
  }

  const forwardedProto = req.headers.get("x-forwarded-proto");
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedOrigin =
    forwardedProto && forwardedHost
      ? `${forwardedProto}://${forwardedHost}`
      : null;
  const baseUrl =
    process.env.NEXTAUTH_URL ?? forwardedOrigin ?? req.nextUrl.origin;

  const redirectUrl = new URL("/media/bimun", baseUrl);
  return NextResponse.redirect(redirectUrl);
}
