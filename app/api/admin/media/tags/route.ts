import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/db/dbreq";
import { gate } from "@/db/permissions";
import {
  getAllTags,
  createTag,
  deleteTag,
  updateTag,
  updateTagType,
  getTagStats,
  MediaTagTypeName,
  getPinnedTags,
  pinTag,
  unpinTag,
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
    const yearTagId = searchParams.get("year_tag_id");
    const eventMainTagId = searchParams.get("event_main_tag_id");

    if (yearTagId && eventMainTagId) {
      const pinned = await getPinnedTags(
        selfUser,
        Number.parseInt(yearTagId, 10),
        Number.parseInt(eventMainTagId, 10),
      );
      return NextResponse.json({ pinned });
    }

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
    const { tag_name, tag_type = "event_part" } = body;

    if (!tag_name || typeof tag_name !== "string") {
      return NextResponse.json(
        { error: "tag_name is required" },
        { status: 400 },
      );
    }

    const validTypes: MediaTagTypeName[] = [
      "year",
      "event_main",
      "event_part",
      "madeBy",
      "person",
    ];
    if (!validTypes.includes(tag_type)) {
      return NextResponse.json({ error: "Invalid tag_type" }, { status: 400 });
    }

    const tagId = await createTag(selfUser, tag_name.trim(), tag_type);
    return NextResponse.json({
      id: tagId,
      tag_name: tag_name.trim(),
      tag_type,
    });
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
 * Body: { id: number, tag_name?: string, tag_type?: MediaTagTypeName }
 */
export async function PUT(request: NextRequest) {
  try {
    const selfUser = await getAuth();
    if (!selfUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    gate(selfUser, ["admin", "media_admin"]);

    const body = await request.json();
    const { id, tag_name, tag_type } = body;

    if (!id || typeof id !== "number")
      return NextResponse.json({ error: "id is required" }, { status: 400 });

    // Update tag name if provided
    if (tag_name && typeof tag_name === "string") {
      await updateTag(selfUser, id, tag_name.trim());
    }

    const validTypes: MediaTagTypeName[] = [
      "year",
      "event_main",
      "event_part",
      "madeBy",
      "person",
    ];
    if (tag_type !== undefined) {
      if (!validTypes.includes(tag_type)) {
        return NextResponse.json({ error: "Invalid tag_type" }, { status: 400 });
      }
      await updateTagType(selfUser, id, tag_type);
    }

    // Must provide at least one field to update
    if (!tag_name && tag_type === undefined) {
      return NextResponse.json(
        { error: "tag_name or tag_type is required" },
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

export async function PATCH(request: NextRequest) {
  try {
    const selfUser = await getAuth();
    if (!selfUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    gate(selfUser, ["admin", "media_admin"]);

    const body = await request.json();
    const { tag_id, year_tag_id, event_main_tag_id, pinned } = body;
    if (
      ![tag_id, year_tag_id, event_main_tag_id].every(
        (value) => typeof value === "number" && Number.isInteger(value),
      ) ||
      typeof pinned !== "boolean"
    ) {
      return NextResponse.json({ error: "Invalid pin payload" }, { status: 400 });
    }

    if (pinned) {
      await pinTag(selfUser, tag_id, year_tag_id, event_main_tag_id);
    } else {
      await unpinTag(selfUser, tag_id, year_tag_id, event_main_tag_id);
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[admin/media/tags] PATCH Error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: error.message === "Permission denied" ? 403 : 500 },
    );
  }
}
