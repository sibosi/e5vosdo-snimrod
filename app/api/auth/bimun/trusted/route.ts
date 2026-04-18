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

  // Redirect back to the gallery page, the cookie will be sent
  const redirectUrl = new URL("/media/bimun", req.url);
  return NextResponse.redirect(redirectUrl);
}
