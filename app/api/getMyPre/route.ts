import { getMyPre } from "@/db/dbreq";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const response = await getMyPre();

  return NextResponse.json(response, { status: 200 });
}
