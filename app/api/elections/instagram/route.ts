import { getAuth } from "@/db/dbreq";
import { hasPermission } from "@/db/permissions";
import { fetchElectionsInstagramFeed } from "@/lib/electionsInstagram";
import { NextResponse } from "next/server";

export async function GET() {
  const selfUser = await getAuth();
  if (!selfUser)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasPermission(selfUser, "tester"))
    return NextResponse.json(
      { error: "This endpoint is only available to testers" },
      { status: 403 },
    );

  try {
    const { account, posts } = await fetchElectionsInstagramFeed();
    return NextResponse.json({
      account,
      posts,
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
