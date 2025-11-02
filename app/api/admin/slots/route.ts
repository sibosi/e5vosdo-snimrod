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

    const slots = await dbreq("SELECT * FROM presentation_slots ORDER BY id");
    return NextResponse.json(slots);
  } catch (error: any) {
    console.error("Error fetching slots:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch slots" },
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

    const { title, details } = await request.json();

    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "A slot neve kötelező" },
        { status: 400 },
      );
    }

    const result = await dbreq(
      "INSERT INTO presentation_slots (title, details) VALUES (?, ?)",
      [title.trim(), details?.trim() || null],
    );

    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error: any) {
    console.error("Error creating slot:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create slot" },
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
        { error: "Slot ID is required" },
        { status: 400 },
      );
    }

    // Check if there are any presentations using this slot
    const [presentationsCheck] = await dbreq(
      "SELECT COUNT(*) as count FROM presentations WHERE slot_id = ?",
      [id],
    );

    if (presentationsCheck.count > 0) {
      return NextResponse.json(
        { error: "Nem törölhető slot, mert prezentációk használják" },
        { status: 400 },
      );
    }

    await dbreq("DELETE FROM presentation_slots WHERE id = ?", [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting slot:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete slot" },
      { status: 500 },
    );
  }
}
