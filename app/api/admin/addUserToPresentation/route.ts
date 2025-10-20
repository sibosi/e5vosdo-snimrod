import { NextRequest, NextResponse } from "next/server";
import { gate } from "@/db/permissions";
import { getAuth } from "@/db/dbreq";
import { adminForceUserSignUp } from "@/db/presentationSignup";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    gate(user, "admin");

    const { email, presentation_id, slot } = await request.json();

    if (!email || !presentation_id || !slot) {
      return NextResponse.json(
        { error: "All fields are required: email, presentation_id, slot" },
        { status: 400 },
      );
    }

    await adminForceUserSignUp(email, presentation_id, slot);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error adding user to presentation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add user to presentation" },
      { status: 500 },
    );
  }
}
