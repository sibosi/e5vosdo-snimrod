import { getAlerts } from "@/db/dbreq";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await getAlerts();

  return NextResponse.json(data);
}
