import { NextResponse } from "next/server";
import { getAuth } from "@/db/dbreq";
import { deleteImages, resetImagesPreviews } from "@/db/mediaPhotos";
import { deleteAllCacheForImage } from "@/lib/mediaCache";
import { gate } from "@/db/permissions";

interface DeleteRequest {
  imageIds: number[];
  mode: "delete" | "reset-previews";
}

export async function POST(request: Request) {
  try {
    const selfUser = await getAuth();
    if (!selfUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    gate(selfUser, ["admin", "media_admin"]);

    const body: DeleteRequest = await request.json();
    const { imageIds, mode } = body;

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json(
        { error: "Image IDs are required" },
        { status: 400 },
      );
    }

    if (!["delete", "reset-previews"].includes(mode)) {
      return NextResponse.json(
        { error: "Invalid mode. Use 'delete' or 'reset-previews'" },
        { status: 400 },
      );
    }

    for (const id of imageIds) {
      deleteAllCacheForImage(id);
    }

    if (mode === "delete") {
      const result = await deleteImages(selfUser, imageIds);
      return NextResponse.json({
        success: true,
        mode: "delete",
        deleted: result.success,
        failed: result.failed,
        deletedDriveIds: result.deletedDriveIds,
        message: `${result.success} kép törölve. Drive ID-k: ${result.deletedDriveIds.length} (töröld manuálisan Drive-ból!)`,
      });
    } else {
      const result = await resetImagesPreviews(selfUser, imageIds);
      return NextResponse.json({
        success: true,
        mode: "reset-previews",
        reset: result.success,
        failed: result.failed,
        deletedDriveIds: result.deletedDriveIds,
        message: `${result.success} kép preview-i törölve. Drive ID-k: ${result.deletedDriveIds.length} (töröld manuálisan Drive-ból!)`,
      });
    }
  } catch (error: any) {
    console.error("[admin/media/delete] Error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 },
    );
  }
}
