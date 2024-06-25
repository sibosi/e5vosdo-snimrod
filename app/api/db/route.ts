import { NextResponse } from "next/server";
import { getEvents } from "@/db/dbreq";

export const GET = async (req: Request) => {
  try {
    const events = await getEvents();
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
};
