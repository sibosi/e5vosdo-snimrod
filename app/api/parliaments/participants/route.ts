import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/db/dbreq";
import {
  getParlamentParticipants,
  registerToParlament,
  unregisterFromParlament,
} from "@/db/parlament";

export async function GET(request: NextRequest) {
  const selfUser = await getAuth();

  if (!selfUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const parlamentId = Number(searchParams.get("parlamentId"));

    if (!Number.isInteger(parlamentId)) {
      return NextResponse.json(
        { error: "Invalid parlamentId" },
        { status: 400 },
      );
    }

    return NextResponse.json(await getParlamentParticipants(selfUser, parlamentId));
  } catch (error) {
    console.error("Error loading parlament participants:", error);
    return NextResponse.json(
      { error: "Failed to load parlament participants" },
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
    const { email, group, parlamentId } = await request.json();

    if (!email || !group || !Number.isInteger(Number(parlamentId))) {
      return NextResponse.json(
        { error: "Email, group and parlamentId are required" },
        { status: 400 },
      );
    }

    const result = await registerToParlament(
      selfUser,
      String(email),
      String(group),
      Number(parlamentId),
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error registering for parlament:", error);
    return NextResponse.json(
      { error: "Failed to register for parlament" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const selfUser = await getAuth();

  if (!selfUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { email, group, parlamentId } = await request.json();

    if (!email || !group || !Number.isInteger(Number(parlamentId))) {
      return NextResponse.json(
        { error: "Email, group and parlamentId are required" },
        { status: 400 },
      );
    }

    const result = await unregisterFromParlament(
      selfUser,
      String(email),
      String(group),
      Number(parlamentId),
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error unregistering from parlament:", error);
    return NextResponse.json(
      { error: "Failed to unregister from parlament" },
      { status: 500 },
    );
  }
}
