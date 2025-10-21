import { NextResponse } from "next/server";
import { getAllUsersNameByEmail, getAuth } from "@/db/dbreq";
import { gate } from "@/db/permissions";

export async function GET() {
  try {
    const user = await getAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!gate(user, "teacher", "boolean")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await getAllUsersNameByEmail();

    return NextResponse.json(users);
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: error.message || "Hiba történt" },
      { status: 500 },
    );
  }
}
