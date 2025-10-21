import { NextRequest, NextResponse } from "next/server";
import {
  markParticipation,
  markAllParticipation,
} from "@/db/presentationSignup";
import { getAuth } from "@/db/dbreq";
import { gate } from "@/db/permissions";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!gate(user, "teacher", "boolean")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { signup_id, presentation_id, participated, markAll } = body;

    if (markAll && presentation_id !== undefined) {
      // Mark all signups for a presentation
      await markAllParticipation(presentation_id, participated);
      return NextResponse.json({
        success: true,
        message: "Minden résztvevő jelölése sikeres",
      });
    } else if (signup_id !== undefined) {
      // Mark individual signup
      await markParticipation(signup_id, participated);
      return NextResponse.json({
        success: true,
        message: "Jelölés sikeres",
      });
    } else {
      return NextResponse.json(
        { error: "signup_id vagy presentation_id szükséges" },
        { status: 400 },
      );
    }
  } catch (error: any) {
    console.error("Error marking participation:", error);
    return NextResponse.json(
      { error: error.message || "Hiba történt a jelölés során" },
      { status: 500 },
    );
  }
}
