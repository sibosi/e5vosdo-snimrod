import { backup } from "@/db/autobackup";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await backup();
  return NextResponse.json(data);
}
