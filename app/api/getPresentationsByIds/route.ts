import { getMembersAtPresentation, getPresentationsByIds } from "@/db/dbreq";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.json();
  const presentation_ids = data.presentation_ids;
  const response = await getPresentationsByIds(
    presentation_ids.map((id: number) => Number(id)),
  );

  return NextResponse.json(response, { status: 200 });
}
