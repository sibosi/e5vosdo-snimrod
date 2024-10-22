import { getAuth, signUpForPresentation } from "@/db/dbreq";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const selfUser = await getAuth();
    if (!selfUser) {
      return NextResponse.json({ error: "No user" }, { status: 401 });
    }

    const data = await req.json();
    const { slot_id, presentation_id } = data;

    const response = await signUpForPresentation(slot_id, presentation_id);

    if (response.success === false) {
      // SQL hiba történt, és a signUpForPresentation már visszaadta a hibát
      return NextResponse.json({ error: response.message }, { status: 500 });
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Server-side error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
