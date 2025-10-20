import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return NextResponse.json({ error: "Down" }, { status: 404 });
}
