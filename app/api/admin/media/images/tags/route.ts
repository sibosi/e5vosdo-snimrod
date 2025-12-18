import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/db/dbreq";
import { gate } from "@/db/permissions";
import {
  getTagsForImage,
  removeTagFromImage,
  bulkAttachTagsToImages,
  removeAllTagsFromImage,
  getAllImagesWithTags,
  searchImagesByTags,
} from "@/db/mediaTags";

/**
 * GET /api/admin/media/images/tags
 * Get images with tags, with optional search
 * Query params:
 *   - imageId: get tags for specific image
 *   - search: comma-separated tag names to search
 *   - matchAll: if true, all tags must match (default: false)
 *   - limit: number of images per page (default: 20)
 *   - offset: pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const selfUser = await getAuth();
    if (!selfUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    gate(selfUser, ["admin", "media_admin"]);

    const searchParams = request.nextUrl.searchParams;
    const imageId = searchParams.get("imageId");
    const search = searchParams.get("search");
    const matchAll = searchParams.get("matchAll") === "true";
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10);
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10);

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
      const images = await searchImagesByTags(selfUser, tagNames, matchAll);
      return NextResponse.json({
        images,
        total: images.length,
        hasMore: false,
      });
    }

    // Return paginated images with tags
    const result = await getAllImagesWithTags(selfUser, { limit, offset });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[admin/media/images/tags] GET Error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: error.message === "Permission denied" ? 403 : 500 },
    );
  }
}

/**
 * POST /api/admin/media/images/tags
 * Attach tags to image(s)
 * Body: {
 *   imageIds: number[],
 *   tags: Array<{
 *     tag_name: string,
 *     coordinate1_x?: number,
 *     coordinate1_y?: number,
 *     coordinate2_x?: number,
 *     coordinate2_y?: number
 *   }>
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const selfUser = await getAuth();
    if (!selfUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    gate(selfUser, ["admin", "media_admin"]);

    const body = await request.json();
    const { imageIds, tags } = body;

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0)
      return NextResponse.json(
        { error: "imageIds array is required" },
        { status: 400 },
      );

    if (!tags || !Array.isArray(tags) || tags.length === 0)
      return NextResponse.json(
        { error: "tags array is required" },
        { status: 400 },
      );

    const result = await bulkAttachTagsToImages(selfUser, imageIds, tags);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[admin/media/images/tags] POST Error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: error.message === "Permission denied" ? 403 : 500 },
    );
  }
}

/**
 * DELETE /api/admin/media/images/tags
 * Remove tag(s) from image(s)
 * Body: {
 *   imageId: number,
 *   tagId?: number,       // If provided, remove specific tag
 *   removeAll?: boolean   // If true, remove all tags from image
 * }
 */
export async function DELETE(request: NextRequest) {
  try {
    const selfUser = await getAuth();
    if (!selfUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    gate(selfUser, ["admin", "media_admin"]);

    const body = await request.json();
    const { imageId, tagId, removeAll } = body;

    if (!imageId || typeof imageId !== "number")
      return NextResponse.json(
        { error: "imageId is required" },
        { status: 400 },
      );

    if (removeAll) {
      await removeAllTagsFromImage(selfUser, imageId);
      return NextResponse.json({ success: true, message: "All tags removed" });
    }

    if (!tagId || typeof tagId !== "number")
      return NextResponse.json(
        { error: "tagId is required (or set removeAll to true)" },
        { status: 400 },
      );

    await removeTagFromImage(selfUser, imageId, tagId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[admin/media/images/tags] DELETE Error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: error.message === "Permission denied" ? 403 : 500 },
    );
  }
}
