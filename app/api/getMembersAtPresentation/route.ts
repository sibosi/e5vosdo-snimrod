import { getMembersAtPresentation } from "@/db/dbreq";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.json();
  const presentation_id = data.presentation_id;
  const response = await getMembersAtPresentation(Number(presentation_id));

  return NextResponse.json(response, { status: 200 });
}
