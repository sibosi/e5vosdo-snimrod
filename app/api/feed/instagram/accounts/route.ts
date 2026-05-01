import { fetchElectionsAccounts } from "@/lib/electionsInstagram";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const accounts = await fetchElectionsAccounts();
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
