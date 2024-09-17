import { getPageSettings } from "@/db/dbreq";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(await getPageSettings());
}
