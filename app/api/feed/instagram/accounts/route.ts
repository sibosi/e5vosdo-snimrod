export const runtime = "nodejs";

import { fetchFeedAccounts } from "@/lib/feedInstagram";
import { getFeedAccountsFromDb, upsertFeedAccounts } from "@/db/feedInstagram";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cached = await getFeedAccountsFromDb();
    if (cached.length > 0) {
      return NextResponse.json({ accounts: cached });
    }

    // TODO: Remove this fallback
    const accounts = await fetchFeedAccounts();
    await upsertFeedAccounts(accounts);
    return NextResponse.json({ accounts });
  } catch (error) {
    console.error("Failed to fetch feed Instagram accounts:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error while fetching accounts";

    return NextResponse.json(
      { error: "Failed to load Instagram accounts", details: message },
      { status: 500 },
    );
  }
}
