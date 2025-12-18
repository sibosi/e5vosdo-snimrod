import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/db/dbreq";
import { gate } from "@/db/permissions";
import { getDriveClient } from "@/db/autobackup";
import {
  getImportedXmlDriveIds,
  recordXmlImport,
  getXmlImportHistory,
} from "@/db/mediaXmlImports";
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

const ORIGINAL_MEDIA_FOLDER_ID =
  process.env.NEXT_PUBLIC_ORIGINAL_MEDIA_FOLDER_ID;

interface DriveXmlFile {
  id: string;
  name: string;
  createdTime: string;
  imported: boolean;
}

/**
 * GET /api/admin/media/import-xml-drive
 * List XML files from Drive folder and their import status
 */
export async function GET(request: NextRequest) {
  try {
    const selfUser = await getAuth();
    if (!selfUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    gate(selfUser, ["admin", "media_admin"]);

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action");

    if (action === "history") {
      const history = await getXmlImportHistory(selfUser, 100);
      return NextResponse.json({ history });
    }

    if (!ORIGINAL_MEDIA_FOLDER_ID) {
      return NextResponse.json(
        { error: "ORIGINAL_MEDIA_FOLDER_ID not configured" },
        { status: 500 },
      );
    }

    const drive = getDriveClient();

    let allFiles: any[] = [];
    let pageToken: string | undefined;

    do {
      const listRes: any = await drive.files.list({
        q: `'${ORIGINAL_MEDIA_FOLDER_ID}' in parents and trashed=false and (mimeType='text/xml' or mimeType='application/xml' or name contains '.xml' or name contains '.xmp')`,
        fields: "nextPageToken, files(id, name, mimeType, createdTime)",
        pageSize: 1000,
        pageToken,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });
      allFiles = allFiles.concat(listRes.data.files || []);
      pageToken = listRes.data.nextPageToken;
    } while (pageToken);

    const xmlFiles = allFiles.filter(
      (f) => f.name.toLowerCase().endsWith(".xml"),
      // || f.name.toLowerCase().endsWith(".xmp"),
    );

    const importedIds = new Set(await getImportedXmlDriveIds());

    const filesWithStatus: DriveXmlFile[] = xmlFiles.map((f) => ({
      id: f.id,
      name: f.name,
      createdTime: f.createdTime,
      imported: importedIds.has(f.id),
    }));

    filesWithStatus.sort((a, b) => {
      if (a.imported !== b.imported) return a.imported ? 1 : -1;
      return a.name.localeCompare(b.name);
    });

    const summary = {
      total: filesWithStatus.length,
      imported: filesWithStatus.filter((f) => f.imported).length,
      notImported: filesWithStatus.filter((f) => !f.imported).length,
    };

    return NextResponse.json({ files: filesWithStatus, summary });
  } catch (error: any) {
    console.error("[admin/media/import-xml-drive] GET Error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: error.message === "Permission denied" ? 403 : 500 },
    );
  }
}

// In-memory progress state for import
let importProgress = {
  running: false,
  current: 0,
  total: 0,
  currentFile: "",
  errors: [] as string[],
  imported: 0,
  skipped: 0,
  startedAt: null as Date | null,
};

/**
 * POST /api/admin/media/import-xml-drive
 * Preview or import XML files from Drive
 * Body: {
 *   action: "preview" | "import",
 *   fileIds?: string[], // If not provided, import all non-imported files
 *   skipImported?: boolean // Default true
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const selfUser = await getAuth();
    if (!selfUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    gate(selfUser, ["admin", "media_admin"]);

    const body = await request.json();
    const { action, fileIds, skipImported = true } = body;

    if (!ORIGINAL_MEDIA_FOLDER_ID) {
      return NextResponse.json(
        { error: "ORIGINAL_MEDIA_FOLDER_ID not configured" },
        { status: 500 },
      );
    }

    if (action === "progress") {
      return NextResponse.json(importProgress);
    }

    if (importProgress.running) {
      return NextResponse.json(
        { error: "Import already in progress" },
        { status: 409 },
      );
    }

    const drive = getDriveClient();

    // Get files to process
    let filesToProcess: { id: string; name: string }[] = [];

    if (fileIds && Array.isArray(fileIds) && fileIds.length > 0) {
      // Specific files requested
      for (const fileId of fileIds) {
        try {
          const fileRes: any = await drive.files.get({
            fileId,
            fields: "id, name",
            supportsAllDrives: true,
          });
          filesToProcess.push({
            id: fileRes.data.id,
            name: fileRes.data.name,
          });
        } catch (e) {
          console.error(`Failed to get file ${fileId}:`, e);
        }
      }
    } else {
      // Get all XML files from folder
      let allFiles: any[] = [];
      let pageToken: string | undefined;

      do {
        const listRes: any = await drive.files.list({
          q: `'${ORIGINAL_MEDIA_FOLDER_ID}' in parents and trashed=false and (mimeType='text/xml' or mimeType='application/xml' or name contains '.xml' or name contains '.xmp')`,
          fields: "nextPageToken, files(id, name)",
          pageSize: 1000,
          pageToken,
          supportsAllDrives: true,
          includeItemsFromAllDrives: true,
        });
        allFiles = allFiles.concat(listRes.data.files || []);
        pageToken = listRes.data.nextPageToken;
      } while (pageToken);

      filesToProcess = allFiles
        .filter(
          (f) => f.name.toLowerCase().endsWith(".xml"),
          // || f.name.toLowerCase().endsWith(".xmp"),
        )
        .map((f) => ({ id: f.id, name: f.name }));
    }

    // Filter out already imported if requested
    if (skipImported) {
      const importedIds = new Set(await getImportedXmlDriveIds());
      filesToProcess = filesToProcess.filter((f) => !importedIds.has(f.id));
    }

    if (filesToProcess.length === 0) {
      return NextResponse.json({
        message: "No files to process",
        summary: { total: 0, imported: 0, skipped: 0 },
      });
    }

    // PREVIEW mode: just show what would be imported
    if (action === "preview") {
      const previews: (XMLImportPreview & { driveId: string })[] = [];

      for (const file of filesToProcess.slice(0, 50)) {
        // Limit preview to 50 files
        try {
          const res: any = await drive.files.get(
            { fileId: file.id, alt: "media", supportsAllDrives: true } as any,
            { responseType: "text" } as any,
          );

          const content = res.data as string;
          const metadata = parseXMPMetadata(content, file.name);

          const baseFileName = file.name.replace(/\.xml$/i, "");
          // .replace(/\.xmp$/i, "");
          const matchedImage = await getImageByOriginalFileName(
            selfUser,
            baseFileName,
          );

          const preview = generateImportPreview(
            metadata,
            matchedImage?.id ?? null,
            matchedImage?.original_file_name ?? null,
          );

          previews.push({ ...preview, driveId: file.id });
        } catch (e: any) {
          previews.push({
            driveId: file.id,
            xmlFileName: file.name,
            matchedImageId: null,
            matchedImageName: null,
            tags: [],
            warnings: [`Failed to read file: ${e.message}`],
          });
        }
      }

      const summary = {
        totalFiles: filesToProcess.length,
        previewedFiles: previews.length,
        matchedImages: previews.filter((p) => p.matchedImageId !== null).length,
        unmatchedImages: previews.filter((p) => p.matchedImageId === null)
          .length,
        totalTags: previews.reduce((sum, p) => sum + p.tags.length, 0),
      };

      return NextResponse.json({ previews, summary });
    }

    // IMPORT mode: actually import the files
    if (action === "import") {
      // Start async import
      (async () => {
        importProgress = {
          running: true,
          current: 0,
          total: filesToProcess.length,
          currentFile: "Starting...",
          errors: [],
          imported: 0,
          skipped: 0,
          startedAt: new Date(),
        };

        for (let i = 0; i < filesToProcess.length; i++) {
          const file = filesToProcess[i];
          importProgress.current = i + 1;
          importProgress.currentFile = file.name;

          try {
            // Download XML content
            const res: any = await drive.files.get(
              { fileId: file.id, alt: "media", supportsAllDrives: true } as any,
              { responseType: "text" } as any,
            );

            const content = res.data as string;
            const metadata = parseXMPMetadata(content, file.name);

            // Match to image
            const baseFileName = file.name.replace(/\.xml$/i, "");
            // .replace(/\.xmp$/i, "");
            const matchedImage = await getImageByOriginalFileName(
              selfUser,
              baseFileName,
            );

            if (!matchedImage) {
              importProgress.skipped++;
              await recordXmlImport(selfUser, file.id, file.name, null, 0);
              continue;
            }

            // Generate tags to import
            const preview = generateImportPreview(
              metadata,
              matchedImage.id,
              matchedImage.original_file_name ?? null,
            );

            if (preview.tags.length === 0) {
              importProgress.skipped++;
              await recordXmlImport(
                selfUser,
                file.id,
                file.name,
                matchedImage.id,
                0,
              );
              continue;
            }

            // Import tags
            const tagAttachments: TagAttachment[] = preview.tags.map((tag) => ({
              tag_name: tag.tagName,
              coordinate1_x: tag.coordinates?.x1 ?? null,
              coordinate1_y: tag.coordinates?.y1 ?? null,
              coordinate2_x: tag.coordinates?.x2 ?? null,
              coordinate2_y: tag.coordinates?.y2 ?? null,
            }));

            const result = await bulkAttachTagsToImages(
              selfUser,
              [matchedImage.id],
              tagAttachments,
            );

            await recordXmlImport(
              selfUser,
              file.id,
              file.name,
              matchedImage.id,
              result.success,
            );

            importProgress.imported++;
          } catch (error: any) {
            importProgress.errors.push(`${file.name}: ${error.message}`);
          }
        }

        importProgress.currentFile = "Done!";
        importProgress.running = false;
      })();

      return NextResponse.json({
        message: "Import started",
        total: filesToProcess.length,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("[admin/media/import-xml-drive] POST Error:", error);
    importProgress.running = false;
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: error.message === "Permission denied" ? 403 : 500 },
    );
  }
}
