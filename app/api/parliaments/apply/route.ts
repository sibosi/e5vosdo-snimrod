import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/db/dbreq";
import { applyToParlamentFromOwnClass } from "@/db/parlament";

export async function POST(request: NextRequest) {
  const selfUser = await getAuth();

  if (!selfUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { parliamentId } = await request.json();

    if (!parliamentId) {
      return NextResponse.json(
        { error: "Parlament ID is required" },
        { status: 400 },
      );
    }

    const result = await applyToParlamentFromOwnClass(
      selfUser,
      Number(parliamentId),
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error applying to parliament:", error);
    return NextResponse.json(
      { error: "Failed to apply to parliament" },
      { status: 500 },
    );
  }
}
