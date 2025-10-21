import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getProgramsWithVotes } from "@/db/classPrograms";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const email = session?.user?.email;

    const programs = await getProgramsWithVotes(email);
    return NextResponse.json(programs);
  } catch (error: any) {
    console.error("Error fetching programs with votes:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch programs" },
      { status: 500 },
    );
  }
}
