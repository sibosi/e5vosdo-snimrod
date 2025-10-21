import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveUserVotes } from "@/db/classPrograms";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { programIds } = body;

    if (!Array.isArray(programIds)) {
      return NextResponse.json(
        { error: "programIds must be an array" },
        { status: 400 },
      );
    }

    if (programIds.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 programot választhatsz" },
        { status: 400 },
      );
    }

    await saveUserVotes(email, programIds);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error saving votes:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save votes" },
      { status: 500 },
    );
  }
}
