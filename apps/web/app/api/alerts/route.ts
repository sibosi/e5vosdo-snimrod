import { getAlerts } from "@/apps/web/db/dbreq";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await getAlerts();
  return NextResponse.json(data);
}
