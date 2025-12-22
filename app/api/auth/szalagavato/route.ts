import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  SZALAGAVATO_COOKIE_NAME,
  SZALAGAVATO_COOKIE_MAX_AGE,
  generateSzalagavatoToken,
  verifySzalagavatoToken,
} from "@/lib/szalagavatoAuth";

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
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(SZALAGAVATO_COOKIE_NAME);

  return NextResponse.json({
    authenticated: verifySzalagavatoToken(authCookie?.value || ""),
  });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SZALAGAVATO_COOKIE_NAME);

  return NextResponse.json({ success: true });
}
