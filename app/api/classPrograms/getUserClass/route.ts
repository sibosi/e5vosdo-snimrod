import { NextResponse } from "next/server";
import { getAuth } from "@/db/dbreq";
import getUserClass from "@/public/getUserClass";

export async function GET() {
  try {
    const selfUser = await getAuth();

    if (!selfUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userClass = getUserClass(selfUser);

    return NextResponse.json({ userClass });
  } catch (error) {
    console.error("Error fetching user class:", error);
    return NextResponse.json(
      { error: "Failed to fetch user class" },
      { status: 500 },
    );
  }
}
