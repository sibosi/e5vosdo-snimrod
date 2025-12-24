// app/api/admin/media/route.ts
// Admin API a média képek kezeléséhez - státusz lekérdezés
import { NextResponse } from "next/server";
import { getAuth } from "@/db/dbreq";
import { gate } from "@/db/permissions";
import { dbreq } from "@/db/db";
import { getCacheStats } from "@/lib/mediaCache";

export async function GET() {
  try {
    const selfUser = await getAuth();
    if (!selfUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    gate(selfUser, ["admin", "media_admin"]);

    // Adatbázis statisztikák
    const [totalResult] = (await dbreq(
      "SELECT COUNT(*) as count FROM media_images",
    )) as { count: number }[];
    const total = totalResult?.count ?? 0;

    const [withColorResult] = (await dbreq(
      "SELECT COUNT(*) as count FROM media_images WHERE color IS NOT NULL",
    )) as { count: number }[];
    const withColor = withColorResult?.count ?? 0;

    const [withSmallPreviewResult] = (await dbreq(
      "SELECT COUNT(*) as count FROM media_images WHERE small_preview_drive_id IS NOT NULL",
    )) as { count: number }[];
    const withSmallPreview = withSmallPreviewResult?.count ?? 0;

    const [withLargePreviewResult] = (await dbreq(
      "SELECT COUNT(*) as count FROM media_images WHERE large_preview_drive_id IS NOT NULL",
    )) as { count: number }[];
    const withLargePreview = withLargePreviewResult?.count ?? 0;

    const [withDatetimeResult] = (await dbreq(
      "SELECT COUNT(*) as count FROM media_images WHERE datetime IS NOT NULL",
    )) as { count: number }[];
    const withDatetime = withDatetimeResult?.count ?? 0;

    // Lokális cache statisztikák
    const cacheStats = getCacheStats();

    return NextResponse.json({
      database: {
        total,
        withColor,
        withoutColor: total - withColor,
        withDatetime,
        withoutDatetime: total - withDatetime,
        withSmallPreview,
        withLargePreview,
      },
      localCache: cacheStats,
    });
  } catch (error: any) {
    console.error("[admin/media] Error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 },
    );
  }
}
