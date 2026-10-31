import { getAuth } from "@/db/dbreq";
import { getMediaNavigationTags } from "@/db/mediaTags";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const selfUser = await getAuth();
    if (!selfUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const tags = await getMediaNavigationTags(
      selfUser,
      searchParams.get("year") || undefined,
      searchParams.get("event_main") || undefined,
    );
    return NextResponse.json(tags);
  } catch (error: any) {
    console.error("[media/navigation-tags] GET Error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: error.message === "Permission denied" ? 403 : 500 },
    );
  }
}
