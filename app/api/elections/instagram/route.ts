import {
  fetchElectionsInstagramFeed,
  type CursorsMap,
} from "@/lib/electionsInstagram";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const cursorsParam = request.nextUrl.searchParams.get("cursors");
    const usernamesParam = request.nextUrl.searchParams.get("usernames");
    const filterUsernames = usernamesParam
      ? usernamesParam.split(",").map((u) => u.trim()).filter(Boolean)
      : undefined;
    const cursors: CursorsMap | undefined = cursorsParam
      ? (JSON.parse(cursorsParam) as CursorsMap)
      : undefined;

    const { account, posts, nextCursors, hasMore } =
      await fetchElectionsInstagramFeed(cursors, filterUsernames);
    return NextResponse.json({
      account,
      posts,
      nextCursors,
      hasMore,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to fetch elections Instagram posts:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error while reading Instagram feed";

    return NextResponse.json(
      { error: "Failed to load Instagram feed", details: message },
      { status: 500 },
    );
  }
}
