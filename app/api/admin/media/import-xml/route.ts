import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/db/dbreq";
import { gate } from "@/db/permissions";
import {
  parseXMPMetadata,
  generateImportPreview,
  XMLImportPreview,
} from "@/lib/xmlMetadataParser";
import {
  getImageByOriginalFileName,
  bulkAttachTagsToImages,
  TagAttachment,
} from "@/db/mediaTags";

/**
 * POST /api/admin/media/import-xml
 * Preview XML imports (stage 1)
 * Body: {
 *   xmlFiles: Array<{ fileName: string, content: string }>
 * }
 * Returns preview of what will be imported
 */
export async function POST(request: NextRequest) {
  try {
    const selfUser = await getAuth();
    if (!selfUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    gate(selfUser, ["admin", "media_admin"]);

    const body = await request.json();
    const { xmlFiles } = body;

    if (!xmlFiles || !Array.isArray(xmlFiles) || xmlFiles.length === 0) {
      return NextResponse.json(
        { error: "xmlFiles array is required" },
        { status: 400 },
      );
    }

    const previews: XMLImportPreview[] = [];

    for (const xmlFile of xmlFiles) {
      const { fileName, content } = xmlFile;

      if (!fileName || !content) {
        continue;
      }

      const metadata = parseXMPMetadata(content, fileName);

      const baseFileName = fileName.replace(/\.xml$/i, "");
      const matchedImage = await getImageByOriginalFileName(
        selfUser,
        baseFileName,
      );

      const preview = generateImportPreview(
        metadata,
        matchedImage?.id ?? null,
        matchedImage?.original_file_name ?? null,
      );

      previews.push(preview);
    }
    const summary = {
      totalFiles: xmlFiles.length,
      matchedImages: previews.filter((p) => p.matchedImageId !== null).length,
      unmatchedImages: previews.filter((p) => p.matchedImageId === null).length,
      totalTags: previews.reduce((sum, p) => sum + p.tags.length, 0),
      personTags: previews.reduce(
        (sum, p) => sum + p.tags.filter((t) => t.isPersonTag).length,
        0,
      ),
      warnings: previews.reduce((sum, p) => sum + p.warnings.length, 0),
    };

    return NextResponse.json({ previews, summary });
  } catch (error: any) {
    console.error("[admin/media/import-xml] POST Error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: error.message === "Permission denied" ? 403 : 500 },
    );
  }
}

/**
 * PUT /api/admin/media/import-xml
 * Confirm and execute XML imports (stage 2)
 * Body: {
 *   imports: Array<{
 *     imageId: number,
 *     tags: Array<{
 *       tag_name: string,
 *       coordinate1_x?: number,
 *       coordinate1_y?: number,
 *       coordinate2_x?: number,
 *       coordinate2_y?: number
 *     }>
 *   }>
 * }
 */
export async function PUT(request: NextRequest) {
  try {
    const selfUser = await getAuth();
    if (!selfUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    gate(selfUser, ["admin", "media_admin"]);

    const body = await request.json();
    const { imports } = body;

    if (!imports || !Array.isArray(imports) || imports.length === 0) {
      return NextResponse.json(
        { error: "imports array is required" },
        { status: 400 },
      );
    }

    let totalSuccess = 0;
    let totalFailed = 0;
    const results: Array<{
      imageId: number;
      success: number;
      failed: number;
    }> = [];

    for (const importItem of imports) {
      const { imageId, tags } = importItem;

      if (!imageId || !tags || !Array.isArray(tags)) continue;

      const tagAttachments: TagAttachment[] = tags.map((tag: any) => ({
        tag_name: tag.tag_name,
        coordinate1_x: tag.coordinate1_x ?? null,
        coordinate1_y: tag.coordinate1_y ?? null,
        coordinate2_x: tag.coordinate2_x ?? null,
        coordinate2_y: tag.coordinate2_y ?? null,
      }));

      const result = await bulkAttachTagsToImages(
        selfUser,
        [imageId],
        tagAttachments,
      );

      results.push({
        imageId,
        success: result.success,
        failed: result.failed,
      });

      totalSuccess += result.success;
      totalFailed += result.failed;
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalSuccess,
        totalFailed,
        imagesProcessed: results.length,
      },
      results,
    });
  } catch (error: any) {
    console.error("[admin/media/import-xml] PUT Error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: error.message === "Permission denied" ? 403 : 500 },
    );
  }
}
