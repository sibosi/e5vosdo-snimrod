import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/db/dbreq";
import { deleteParlament, getParlament } from "@/db/parlament";

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

    return NextResponse.json(await getParlament(selfUser, parlamentId));
  } catch (error) {
    console.error("Error loading parlament:", error);
    return NextResponse.json(
      { error: "Failed to load parlament" },
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
    const { parlamentId } = await request.json();

    if (!Number.isInteger(Number(parlamentId))) {
      return NextResponse.json(
        { error: "Invalid parlamentId" },
        { status: 400 },
      );
    }

    return NextResponse.json(await getParlament(selfUser, Number(parlamentId)));
  } catch (error) {
    console.error("Error loading parlament:", error);
    return NextResponse.json(
      { error: "Failed to load parlament" },
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
    const { parlamentId } = await request.json();

    if (!Number.isInteger(Number(parlamentId))) {
      return NextResponse.json(
        { error: "Invalid parlamentId" },
        { status: 400 },
      );
    }

    const result = await deleteParlament(selfUser, Number(parlamentId));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting parlament:", error);
    return NextResponse.json(
      { error: "Failed to delete parlament" },
      { status: 500 },
    );
  }
}
