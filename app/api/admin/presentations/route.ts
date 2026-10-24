import { NextRequest, NextResponse } from "next/server";
import { gate } from "@/db/permissions";
import { getAuth } from "@/db/dbreq";
import { dbreq, multipledbreq } from "@/db/presentationSignup";

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
      open_for = "nobody",
      linked_presentation_id = null,
    } = await request.json();

    if (
      !title ||
      slot_id === undefined ||
      slot_id === null ||
      capacity === undefined ||
      capacity === null
    ) {
      let missingFields = [];
      if (!title) missingFields.push("név");
      if (slot_id === undefined || slot_id === null) missingFields.push("sáv");
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

    if (!["everyone", "only_priority", "nobody"].includes(open_for)) {
      return NextResponse.json(
        { error: "Érvénytelen jelentkezési jogosultság" },
        { status: 400 },
      );
    }

    const result = await dbreq(
      "INSERT INTO presentations (title, performer, slot_id, description, address, requirements, capacity, remaining_capacity, open_for) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        title,
        performer,
        slot_id,
        description || null,
        address || null,
        requirements || null,
        capacity,
        capacity,
        open_for,
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
      open_for = "nobody",
      linked_presentation_id = null,
    } = await request.json();

    if (
      !id ||
      slot_id === undefined ||
      slot_id === null ||
      !title ||
      capacity === undefined ||
      capacity === null
    ) {
      return NextResponse.json(
        {
          error: "Minden mező kitöltése kötelező (ID, slot_id, név, kapacitás)",
        },
        { status: 400 },
      );
    }

    if (!["everyone", "only_priority", "nobody"].includes(open_for)) {
      return NextResponse.json(
        { error: "Érvénytelen jelentkezési jogosultság" },
        { status: 400 },
      );
    }

    await multipledbreq(async (conn) => {
      const ids = [id, linked_presentation_id]
        .filter((value): value is number => value !== null)
        .sort((a, b) => a - b);
      const [lockedRows] = await conn.execute(
        `SELECT id, slot_id, linked_presentation_id, capacity,
                remaining_capacity
         FROM presentations
         WHERE id IN (${ids.map(() => "?").join(",")})
            OR linked_presentation_id IN (${ids.map(() => "?").join(",")})
         ORDER BY id
         FOR UPDATE`,
        [...ids, ...ids],
      );
      const rows = lockedRows as Array<{
        id: number;
        slot_id: number;
        linked_presentation_id: number | null;
        capacity: number;
        remaining_capacity: number | null;
      }>;
      const current = rows.find((presentation) => presentation.id === id);
      if (!current) throw new Error("A prezentáció nem található");

      const [signupRows] = await conn.execute(
        `SELECT presentation_id, COALESCE(SUM(amount), 0) AS total
         FROM signups
         WHERE presentation_id IN (${rows.map(() => "?").join(",")})
         GROUP BY presentation_id`,
        rows.map((presentation) => presentation.id),
      );
      const signupTotals = new Map(
        (signupRows as Array<{ presentation_id: number; total: number }>).map(
          (row) => [row.presentation_id, row.total],
        ),
      );
      const currentSignupsTotal = signupTotals.get(id) ?? 0;
      const hasCurrentSignups = currentSignupsTotal > 0;
      const linkChanged =
        (current.linked_presentation_id ?? null) !==
        (linked_presentation_id ?? null);
      if (hasCurrentSignups && (current.slot_id !== slot_id || linkChanged)) {
        throw new Error(
          "Jelentkezőkkel rendelkező előadás sávja és duplaelőadás-kapcsolata nem módosítható",
        );
      }

      const linkedTarget =
        linked_presentation_id === null
          ? undefined
          : rows.find(
              (presentation) => presentation.id === linked_presentation_id,
            );
      if (linked_presentation_id !== null && !linkedTarget) {
        throw new Error("A kapcsolt prezentáció nem található");
      }
      if (linkedTarget && linkedTarget.slot_id === slot_id) {
        throw new Error("Csak különböző sávban lévő előadások köthetők össze");
      }
      const affectedLinkIds = [
        id,
        current.linked_presentation_id,
        linked_presentation_id,
      ].filter((value): value is number => value !== null);
      if (
        linkChanged &&
        affectedLinkIds.some(
          (affectedId) => (signupTotals.get(affectedId) ?? 0) > 0,
        )
      ) {
        throw new Error("Jelentkezéssel rendelkező előadás nem köthető össze");
      }
      const newRemainingCapacity =
        current.remaining_capacity === null
          ? null
          : capacity - currentSignupsTotal;
      await conn.execute(
        `UPDATE presentations
         SET slot_id = ?, title = ?, performer = ?, description = ?,
             address = ?, requirements = ?, capacity = ?,
             remaining_capacity = ?, open_for = ?
         WHERE id = ?`,
        [
          hasCurrentSignups ? current.slot_id : slot_id,
          title,
          performer,
          description || null,
          address || null,
          requirements || null,
          capacity,
          newRemainingCapacity,
          open_for,
          id,
        ],
      );

      if (linkChanged) {
        await conn.execute(
          `UPDATE presentations
           SET linked_presentation_id = NULL
           WHERE linked_presentation_id IN (?, ?) OR id IN (?, ?)`,
          [
            id,
            current.linked_presentation_id ?? id,
            id,
            current.linked_presentation_id ?? id,
          ],
        );
        if (linked_presentation_id !== null) {
          await conn.execute(
            `UPDATE presentations
             SET linked_presentation_id = ?
             WHERE id = ?`,
            [linked_presentation_id, id],
          );
          await conn.execute(
            `UPDATE presentations
             SET linked_presentation_id = ?
             WHERE id = ?`,
            [id, linked_presentation_id],
          );
        }
      }
    });

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
