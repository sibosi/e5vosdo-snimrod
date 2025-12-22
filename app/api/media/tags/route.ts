// app/api/media/tags/route.ts
// Public API for searching images by tags

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/db/dbreq";
import { gate } from "@/db/permissions";
import {
  getAllTags,
  getTagsForImage,
  searchImagesByTags,
} from "@/db/mediaTags";

/**
 * GET /api/media/tags
 * Get all tags or search images by tags
 * Query params:
 *   - imageId: get tags for specific image
 *   - search: comma-separated tag names to search
 *   - matchAll: if true, all tags must match (default: false)
 */
export async function GET(request: NextRequest) {
  try {
    const selfUser = await getAuth();
    if (!selfUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    gate(selfUser, "user");

    const searchParams = request.nextUrl.searchParams;
    const imageId = searchParams.get("imageId");
    const search = searchParams.get("search");
    const matchAll = searchParams.get("matchAll") === "true";

    // Get tags for specific image
    if (imageId) {
      const tags = await getTagsForImage(
        selfUser,
        Number.parseInt(imageId, 10),
      );
      return NextResponse.json({ tags });
    }

    // Search by tags
    if (search) {
      const tagNames = search
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      const images = await searchImagesByTags(selfUser, {
        tagNames: tagNames,
        matchAll: matchAll,
      });
      return NextResponse.json({ images });
    }

    // Return all tags
    const tags = await getAllTags(selfUser);
    return NextResponse.json({ tags });
  } catch (error: any) {
    console.error("[media/tags] GET Error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: error.message === "Permission denied" ? 403 : 500 },
    );
  }
}
