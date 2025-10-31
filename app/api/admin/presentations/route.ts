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
      slot_id,
      description,
      address,
      requirements,
      capacity,
    } = await request.json();

    if (
      !title ||
      slot_id === undefined ||
      slot_id === null ||
      !description ||
      !address ||
      !requirements ||
      capacity === undefined ||
      capacity === null
    ) {
      let missingFields = [];
      if (!title) missingFields.push("név");
      if (slot_id === undefined || slot_id === null) missingFields.push("sáv");
      if (!description) missingFields.push("leírás");
      if (!address) missingFields.push("helyszín");
      if (!requirements) missingFields.push("követelmények");
      if (capacity === undefined || capacity === null)
        missingFields.push("kapacitás");
      return NextResponse.json(
        {
          error:
            "Minden mező kitöltése kötelező " +
            "(" +
            missingFields.filter(Boolean).join(", ") +
            ")",
        },
        { status: 400 },
      );
    }

    const result = await dbreq(
      "INSERT INTO presentations (title, performer, slot_id, description, address, requirements, capacity, remaining_capacity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        title,
        performer,
        slot_id,
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
      slot_id,
      title,
      performer,
      description,
      address,
      requirements,
      capacity,
    } = await request.json();

    if (
      !id ||
      slot_id === undefined ||
      slot_id === null ||
      !title ||
      !description ||
      !address ||
      capacity === undefined ||
      capacity === null
    ) {
      return NextResponse.json(
        {
          error:
            "Minden mező kitöltése kötelező (ID, slot_id, név, leírás, kapacitás, helyszín)",
        },
        { status: 400 },
      );
    }

    // Get current signups total amount (sum of all amounts)
    const [signupsResult] = await dbreq(
      "SELECT COALESCE(SUM(amount), 0) as total FROM signups WHERE presentation_id = ?",
      [id],
    );
    const currentSignupsTotal = signupsResult.total;

    if (capacity < currentSignupsTotal && !gate(user, "admin", "boolean")) {
      return NextResponse.json(
        {
          error: `Cannot set capacity below current signups total (${currentSignupsTotal})`,
        },
        { status: 400 },
      );
    }

    const currentRemainingCapacityResult = await dbreq(
      "SELECT remaining_capacity FROM presentations WHERE id = ?",
      [id],
    );
    const currentRemainingCapacity =
      currentRemainingCapacityResult[0].remaining_capacity;

    const newRemainingCapacity =
      currentRemainingCapacity === null ? null : capacity - currentSignupsTotal;

    await dbreq(
      "UPDATE presentations SET slot_id = ?, title = ?, performer = ?, description = ?, address = ?, requirements = ?, capacity = ?, remaining_capacity = ? WHERE id = ?",
      [
        slot_id,
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
      "SELECT COALESCE(SUM(amount), 0) as total FROM signups WHERE presentation_id = ?",
      [id],
    );

    if (signupsResult.total > 0) {
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
