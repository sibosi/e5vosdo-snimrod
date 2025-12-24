// app/api/admin/media/progress/route.ts
// Global progress endpoint for all media admin operations

import { NextResponse } from "next/server";
import { getGlobalProgress } from "@/lib/globalProgress";

// GET: Global progress lekérdezése
export async function GET() {
  return NextResponse.json(getGlobalProgress());
}
