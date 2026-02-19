import { NextRequest, NextResponse } from "next/server";
import { gate } from "@/db/permissions";
import { getAuth } from "@/db/dbreq";
import { adminRemoveUserFromPresentation } from "@/db/presentationSignup";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    gate(user, "admin");

    const { email, presentation_id } = await request.json();

    if (!email || !presentation_id) {
      return NextResponse.json(
        { error: "Required fields: email, presentation_id" },
        { status: 400 },
      );
    }

    await adminRemoveUserFromPresentation(email, presentation_id);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to remove user from presentation";
    console.error("Error removing user from presentation:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
