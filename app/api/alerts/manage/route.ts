import {
  getAuth,
  createAlert,
  updateAlert,
  deleteAlert,
  getAlerts,
} from "@/db/dbreq";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const selfUser = await getAuth();
  if (!selfUser?.permissions.includes("admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getAlerts();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const selfUser = await getAuth();
  if (!selfUser?.permissions.includes("admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { text, className, padding, icon } = body;

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const result = await createAlert(text, className, padding, icon);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Failed to create alert:", error);
    return NextResponse.json(
      { error: "Failed to create alert" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const selfUser = await getAuth();
  if (!selfUser?.permissions.includes("admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, text, className, padding, icon } = body;

    if (!id || !text) {
      return NextResponse.json(
        { error: "ID and text are required" },
        { status: 400 },
      );
    }

    const result = await updateAlert(id, text, className, padding, icon);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Failed to update alert:", error);
    return NextResponse.json(
      { error: "Failed to update alert" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const selfUser = await getAuth();
  if (!selfUser?.permissions.includes("admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const result = await deleteAlert(Number(id));
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Failed to delete alert:", error);
    return NextResponse.json(
      { error: "Failed to delete alert" },
      { status: 500 },
    );
  }
}
