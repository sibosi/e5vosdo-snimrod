import { EventType } from "@/components/events";
import { getEvents } from "@/db/dbreq";
import { NextResponse } from "next/server";

const CACHE_DURATION = 1000 * 60 * 1; // 1 minute
let cachedData: EventType[];
let lastUpdated: number;

export async function GET() {
  if (cachedData && lastUpdated && Date.now() - lastUpdated < CACHE_DURATION) {
    console.log("Using cached data...");
    return NextResponse.json(cachedData);
  }

  cachedData = await getEvents();
  cachedData.sort((a, b) => {
    if (!a.show_time) return 1;
    if (!b.show_time) return -1;
    return new Date(a.show_time).getTime() - new Date(b.show_time).getTime();
  });

  lastUpdated = Date.now();
  return NextResponse.json(cachedData);
}

export async function POST(request: Request) {
  const data = await request.json();
  return NextResponse.json({ data });
}
