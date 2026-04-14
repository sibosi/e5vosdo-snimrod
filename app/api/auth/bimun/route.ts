import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  BIMUN_COOKIE_NAME,
  BIMUN_COOKIE_MAX_AGE,
  generateBimunToken,
  verifyBimunToken,
} from "@/lib/bimunAuth";
import { auth } from "@/auth";

const BIMUN_PASSWORD = process.env.BIMUN_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (password === BIMUN_PASSWORD) {
      const cookieStore = await cookies();
      const token = generateBimunToken();

      cookieStore.set(BIMUN_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: BIMUN_COOKIE_MAX_AGE,
        path: "/",
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "Hibás jelszó" },
      { status: 401 },
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Szerver hiba" },
      { status: 500 },
    );
  }
}

export async function GET() {
  console.log("[bimun GET] Starting auth check...");

  const cookieStore = await cookies();
  const authCookie = cookieStore.get(BIMUN_COOKIE_NAME);

  // If cookie is already valid, return immediately
  if (verifyBimunToken(authCookie?.value || "")) {
    console.log("[bimun GET] Valid bimun cookie found");
    return NextResponse.json({ authenticated: true });
  }

  console.log(
    "[bimun GET] No valid bimun cookie, checking NextAuth session...",
  );

  // Try to get NextAuth session; guard against errors so the route doesn't 500
  let session: any = null;
  try {
    session = await auth();
    console.log(
      "[bimun GET] Session result:",
      session ? `User: ${session?.user?.email}` : "No session",
    );
  } catch (e) {
    // Log for debugging — server logs will show this
    console.error("[bimun GET] Error while calling auth():", e);
    // Fail gracefully and report not authenticated
    return NextResponse.json({ authenticated: false });
  }

  if (session?.user?.email) {
    console.log("[bimun GET] User is logged in, setting cookie...");
    try {
      const token = generateBimunToken();

      cookieStore.set(BIMUN_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: BIMUN_COOKIE_MAX_AGE,
        path: "/",
      });
      console.log("[bimun GET] Cookie set successfully");
    } catch (e) {
      console.error("[bimun GET] Failed to set bimun cookie:", e);
      // Even if setting cookie fails, return authenticated=false so client can handle
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({ authenticated: true });
  }

  console.log("[bimun GET] No session found, returning unauthenticated");
  return NextResponse.json({ authenticated: false });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(BIMUN_COOKIE_NAME);

  return NextResponse.json({ success: true });
}
