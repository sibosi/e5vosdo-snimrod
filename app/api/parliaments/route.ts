import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/db/dbreq";
import {
  createParlament,
  getParlaments,
} from "@/db/parlament";

export async function GET() {
  const selfUser = await getAuth();

  if (!selfUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json(await getParlaments(selfUser));
  } catch (error) {
    console.error("Error loading parlaments:", error);
    return NextResponse.json(
      { error: "Failed to load parlaments" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const selfUser = await getAuth();

  if (!selfUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { date, title } = await request.json();

    if (!date) {
      return NextResponse.json(
        { error: "Parlament date is required" },
        { status: 400 },
      );
    }

    const result = await createParlament(selfUser, String(date), title);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating parlament:", error);
    return NextResponse.json(
      { error: "Failed to create parlament" },
      { status: 500 },
    );
  }
}
