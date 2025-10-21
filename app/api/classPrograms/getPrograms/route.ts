import { NextRequest, NextResponse } from "next/server";
import { getClassPrograms } from "@/db/classPrograms";

export async function GET(request: NextRequest) {
  try {
    const programs = await getClassPrograms();
    return NextResponse.json(programs);
  } catch (error: any) {
    console.error("Error fetching class programs:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch programs" },
      { status: 500 },
    );
  }
}
