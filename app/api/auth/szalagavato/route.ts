import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  SZALAGAVATO_COOKIE_NAME,
  SZALAGAVATO_COOKIE_MAX_AGE,
  generateSzalagavatoToken,
  verifySzalagavatoToken,
} from "@/lib/szalagavatoAuth";
import { auth } from "@/auth";

const SZALAGAVATO_PASSWORD = process.env.SZALAGAVATO_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (password === SZALAGAVATO_PASSWORD) {
      const cookieStore = await cookies();
      const token = generateSzalagavatoToken();

      cookieStore.set(SZALAGAVATO_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SZALAGAVATO_COOKIE_MAX_AGE,
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
  console.log("[szalagavato GET] Starting auth check...");

  const cookieStore = await cookies();
  const authCookie = cookieStore.get(SZALAGAVATO_COOKIE_NAME);

  // If cookie is already valid, return immediately
  if (verifySzalagavatoToken(authCookie?.value || "")) {
    console.log("[szalagavato GET] Valid szalagavato cookie found");
    return NextResponse.json({ authenticated: true });
  }

  console.log(
    "[szalagavato GET] No valid szalagavato cookie, checking NextAuth session...",
  );

  // Try to get NextAuth session; guard against errors so the route doesn't 500
  let session: any = null;
  try {
    session = await auth();
    console.log(
      "[szalagavato GET] Session result:",
      session ? `User: ${session?.user?.email}` : "No session",
    );
  } catch (e) {
    // Log for debugging — server logs will show this
    console.error("[szalagavato GET] Error while calling auth():", e);
    // Fail gracefully and report not authenticated
    return NextResponse.json({ authenticated: false });
  }

  if (session?.user?.email) {
    console.log("[szalagavato GET] User is logged in, setting cookie...");
    try {
      const token = generateSzalagavatoToken();

      cookieStore.set(SZALAGAVATO_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SZALAGAVATO_COOKIE_MAX_AGE,
        path: "/",
      });
      console.log("[szalagavato GET] Cookie set successfully");
    } catch (e) {
      console.error("[szalagavato GET] Failed to set szalagavato cookie:", e);
      // Even if setting cookie fails, return authenticated=false so client can handle
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({ authenticated: true });
  }

  console.log("[szalagavato GET] No session found, returning unauthenticated");
  return NextResponse.json({ authenticated: false });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SZALAGAVATO_COOKIE_NAME);

  return NextResponse.json({ success: true });
}
