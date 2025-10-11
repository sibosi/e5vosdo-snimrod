import { NextResponse } from "next/server";
import { gate } from "@/db/permissions";
import { getAuth } from "@/db/dbreq";
import { getAllSignups } from "@/db/presentationSignup";

export async function GET() {
  try {
    const user = await getAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    gate(user, "admin");

    const signups = await getAllSignups();
    return NextResponse.json(signups);
  } catch (error: any) {
    console.error("Error fetching signups:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch signups" },
      { status: 500 },
    );
  }
}
