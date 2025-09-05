import { NextResponse } from "next/server";
import { EventType, getEventEvents } from "@/apps/web/db/event";
import { GET as getEJGEvents } from "@/apps/web/app/api/getEJGEvents/route";

export async function GET(request: Request) {
  try {
    // Fetch internal events
    const internalEvents = await getEventEvents();

    const externalRespontse = await getEJGEvents();
    const externalEvents = (await externalRespontse.json()) as EventType[];

    // Combine events
    const combinedEvents = [...internalEvents, ...externalEvents];

    return NextResponse.json(combinedEvents);
  } catch (error) {
    console.error("Error fetching combined events:", error);
    return NextResponse.json(
      { error: "Failed to fetch combined events" },
      { status: 500 },
    );
  }
}
