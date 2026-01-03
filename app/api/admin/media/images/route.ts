import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/db/dbreq";
import { gate } from "@/db/permissions";
import { dbreq } from "@/db/db";
import { MediaImageType } from "@/db/mediaPhotos";

/**
 * GET /api/admin/media/images
 * Get images with optional filtering and pagination
 * Query params:
 *   - page: page number (default: 1)
 *   - limit: items per page (default: 50)
 *   - filter: 'all' | 'with-preview' | 'no-preview' (default: 'all')
 */
export async function GET(request: NextRequest) {
  try {
    const selfUser = await getAuth();
    if (!selfUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    gate(selfUser, ["admin", "media_admin"]);

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(
      1,
      Number.parseInt(searchParams.get("page") || "1", 10),
    );
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(searchParams.get("limit") || "50", 10)),
    );
    const filter = searchParams.get("filter") || "all";
    const offset = (page - 1) * limit;

    let whereClause = "";
    if (filter === "with-preview") {
      whereClause =
        "WHERE small_preview_drive_id IS NOT NULL OR large_preview_drive_id IS NOT NULL";
    } else if (filter === "no-preview") {
      whereClause =
        "WHERE small_preview_drive_id IS NULL AND large_preview_drive_id IS NULL";
    }

    const [countResult] = (await dbreq(
      `SELECT COUNT(*) as count FROM media_images ${whereClause}`,
    )) as { count: number }[];
    const total = countResult?.count ?? 0;

    const images = (await dbreq(
      `SELECT * FROM media_images ${whereClause} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`,
    )) as MediaImageType[];

    return NextResponse.json({
      images,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("[admin/media/images] Error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 },
    );
  }
}
