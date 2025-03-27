import { getNextMatch } from "@/db/matches";
import { NextResponse } from "next/server";

export async function GET() {
  const soccerData = await getNextMatch();
  return NextResponse.json(soccerData);
}

export async function POST() {
  return NextResponse.json({
    status: 500,
    message: "POST requests are not supported",
  });
}
