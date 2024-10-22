import { getAuth, getPresentations } from "@/db/dbreq";
import { NextResponse } from "next/server";

export async function GET() {
  const selfUser = getAuth();
  const data = await getPresentations();

  return NextResponse.json(data);
}
