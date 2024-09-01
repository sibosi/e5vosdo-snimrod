import { getEvents } from "@/db/dbreq";
import { NextResponse } from "next/server";

const CACHE_DURATION = 1000 * 60 * 60; // 1 hour
let cachedData: any[];
let lastUpdated: number;

export async function GET() {
  if (cachedData && lastUpdated && Date.now() - lastUpdated < CACHE_DURATION) {
    console.log("Using cached data...");
    return NextResponse.json(cachedData);
  }

  cachedData = await getEvents();
  lastUpdated = Date.now();
  return NextResponse.json(cachedData);
}

export async function POST(request: Request) {
  const data = await request.json();
  return NextResponse.json({ data });
}
