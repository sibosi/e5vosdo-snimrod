import { NextRequest, NextResponse } from "next/server";
import { getSignupsWithParticipation } from "@/db/presentationSignup";
import { getAuth, getUser } from "@/db/dbreq";
import getUserClass from "@/public/getUserClass";
import { gate } from "@/db/permissions";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!gate(user, "teacher", "boolean")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const presentation_id = searchParams.get("presentation_id");

    if (!presentation_id) {
      return NextResponse.json(
        { error: "presentation_id kötelező" },
        { status: 400 },
      );
    }

    const signups = await getSignupsWithParticipation(
      parseInt(presentation_id, 10),
    );

    // Enrich signups with user information
    const signupsWithUsers = await Promise.all(
      signups.map(async (signup) => {
        const userData = await getUser(signup.email);
        return {
          ...signup,
          userName: userData?.full_name || userData?.name || "N/A",
          userClass: getUserClass(userData) || "N/A",
        };
      }),
    );

    return NextResponse.json(signupsWithUsers);
  } catch (error: any) {
    console.error("Error fetching signups with participation:", error);
    return NextResponse.json(
      { error: error.message || "Hiba történt" },
      { status: 500 },
    );
  }
}
