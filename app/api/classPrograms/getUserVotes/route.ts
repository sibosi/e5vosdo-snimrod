import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserVotes } from "@/db/classPrograms";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const votes = await getUserVotes(email);
    return NextResponse.json(votes);
  } catch (error: any) {
    console.error("Error fetching user votes:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch votes" },
      { status: 500 },
    );
  }
}
