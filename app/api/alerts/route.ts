import { getAlerts, getAuth } from "@/db/dbreq";
import { NextResponse } from "next/server";

export async function GET() {
  const selfUser = getAuth()
  const data = await getAlerts();

  return NextResponse.json(data);
}
