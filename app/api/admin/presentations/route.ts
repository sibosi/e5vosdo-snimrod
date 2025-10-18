import { NextRequest, NextResponse } from "next/server";
import { gate } from "@/db/permissions";
import { getAuth } from "@/db/dbreq";
import { dbreq } from "@/db/presentationSignup";

export async function GET() {
  try {
    const user = await getAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    gate(user, "admin");

    const presentations = await dbreq(
      "SELECT * FROM presentations ORDER BY id",
    );
    return NextResponse.json(presentations);
  } catch (error: any) {
    console.error("Error fetching presentations:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch presentations" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    gate(user, "admin");

    const {
      title,
      performer,
      slot,
      description,
      address,
      requirements,
      capacity,
    } = await request.json();

    if (
      !title ||
      !slot ||
      !description ||
      !address ||
      !requirements ||
      !capacity
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    const result = await dbreq(
      "INSERT INTO presentations (title, performer, slot, description, address, requirements, capacity, remaining_capacity) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        title,
        performer,
        slot,
        description,
        address,
        requirements,
        capacity,
        capacity,
      ],
    );

    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error: any) {
    console.error("Error creating presentation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create presentation" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    gate(user, "admin");

    const {
      id,
      slot,
      title,
      performer,
      description,
      address,
      requirements,
      capacity,
    } = await request.json();

    if (
      !id ||
      !slot ||
      !title ||
      !description ||
      !address ||
      capacity === undefined ||
      capacity === null
    ) {
      return NextResponse.json(
        {
          error:
            "Minden mező kitöltése kötelező (ID, slot, név, leírás, kapacitás, helyszín)",
        },
        { status: 400 },
      );
    }

    // Get current signups count
    const [signupsResult] = await dbreq(
      "SELECT COUNT(*) as count FROM signups WHERE presentation_id = ?",
      [id],
    );
    const currentSignups = signupsResult.count;

    if (capacity < currentSignups) {
      return NextResponse.json(
        {
          error: `Cannot set capacity below current signups (${currentSignups})`,
        },
        { status: 400 },
      );
    }

    const newRemainingCapacity = capacity - currentSignups;

    await dbreq(
      "UPDATE presentations SET slot = ?, title = ?, performer = ?, description = ?, address = ?, requirements = ?, capacity = ?, remaining_capacity = ? WHERE id = ?",
      [
        slot,
        title,
        performer,
        description,
        address,
        requirements,
        capacity,
        newRemainingCapacity,
        id,
      ],
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating presentation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update presentation" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    gate(user, "admin");

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Presentation ID is required" },
        { status: 400 },
      );
    }

    // Check if there are any signups for this presentation
    const [signupsResult] = await dbreq(
      "SELECT COUNT(*) as count FROM signups WHERE presentation_id = ?",
      [id],
    );

    if (signupsResult.count > 0) {
      return NextResponse.json(
        { error: "Cannot delete presentation with existing signups" },
        { status: 400 },
      );
    }

    await dbreq("DELETE FROM presentations WHERE id = ?", [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting presentation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete presentation" },
      { status: 500 },
    );
  }
}
