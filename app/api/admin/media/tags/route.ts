import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/db/dbreq";
import { gate } from "@/db/permissions";
import {
  getAllTags,
  createTag,
  deleteTag,
  updateTag,
  updateTagPriority,
  getTagStats,
} from "@/db/mediaTags";

/**
 * GET /api/admin/media/tags
 * Get all tags with optional stats
 */
export async function GET(request: NextRequest) {
  try {
    const selfUser = await getAuth();
    if (!selfUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    gate(selfUser, ["admin", "media_admin"]);

    const searchParams = request.nextUrl.searchParams;
    const withStats = searchParams.get("stats") === "true";

    if (withStats) {
      const stats = await getTagStats(selfUser);
      return NextResponse.json({ tags: stats });
    }

    const tags = await getAllTags(selfUser);
    return NextResponse.json({ tags });
  } catch (error: any) {
    console.error("[admin/media/tags] GET Error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: error.message === "Permission denied" ? 403 : 500 },
    );
  }
}

/**
 * POST /api/admin/media/tags
 * Create a new tag
 * Body: { tag_name: string }
 */
export async function POST(request: NextRequest) {
  try {
    const selfUser = await getAuth();
    if (!selfUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    gate(selfUser, ["admin", "media_admin"]);

    const body = await request.json();
    const { tag_name } = body;

    if (!tag_name || typeof tag_name !== "string") {
      return NextResponse.json(
        { error: "tag_name is required" },
        { status: 400 },
      );
    }

    const tagId = await createTag(selfUser, tag_name.trim());
    return NextResponse.json({ id: tagId, tag_name: tag_name.trim() });
  } catch (error: any) {
    console.error("[admin/media/tags] POST Error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: error.message === "Permission denied" ? 403 : 500 },
    );
  }
}

/**
 * PUT /api/admin/media/tags
 * Update a tag
 * Body: { id: number, tag_name?: string, priority?: "madeBy" | "normal" | "high" }
 */
export async function PUT(request: NextRequest) {
  try {
    const selfUser = await getAuth();
    if (!selfUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    gate(selfUser, ["admin", "media_admin"]);

    const body = await request.json();
    const { id, tag_name, priority } = body;

    if (!id || typeof id !== "number")
      return NextResponse.json({ error: "id is required" }, { status: 400 });

    // Update tag name if provided
    if (tag_name && typeof tag_name === "string") {
      await updateTag(selfUser, id, tag_name.trim());
    }

    // Update priority if provided
    if (priority && ["madeBy", "normal", "high"].includes(priority)) {
      await updateTagPriority(selfUser, id, priority);
    }

    // Must provide at least one field to update
    if (!tag_name && !priority) {
      return NextResponse.json(
        { error: "tag_name or priority is required" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[admin/media/tags] PUT Error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: error.message === "Permission denied" ? 403 : 500 },
    );
  }
}

/**
 * DELETE /api/admin/media/tags
 * Delete a tag
 * Body: { id: number }
 */
export async function DELETE(request: NextRequest) {
  try {
    const selfUser = await getAuth();
    if (!selfUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    gate(selfUser, ["admin", "media_admin"]);

    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== "number") {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await deleteTag(selfUser, id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[admin/media/tags] DELETE Error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: error.message === "Permission denied" ? 403 : 500 },
    );
  }
}
