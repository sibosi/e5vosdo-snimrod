import { NextRequest, NextResponse } from "next/server";
import { createUserByEmail, getAuth } from "@/db/dbreq";
import { gate } from "@/db/permissions";
import { isValidEmailAddress } from "@/lib/emailValidation";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    gate(user, "admin");

    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    if (!isValidEmailAddress(email)) {
      return NextResponse.json(
        { error: "Érvényes email cím megadása kötelező." },
        { status: 400 },
      );
    }

    const createdUser = await createUserByEmail(email);
    return NextResponse.json({ user: createdUser }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Ezzel az email címmel már létezik felhasználó." ||
        (error as Error & { code?: string }).code === "ER_DUP_ENTRY")
    ) {
      return NextResponse.json(
        { error: "Ezzel az email címmel már létezik felhasználó." },
        { status: 409 },
      );
    }

    console.error("Error creating user by email:", error);
    return NextResponse.json(
      { error: "A felhasználó létrehozása sikertelen." },
      { status: 500 },
    );
  }
}
