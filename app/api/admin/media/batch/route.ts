// app/api/admin/media/batch/route.ts
// Összevont műveletek - egy letöltéssel minden művelet egy képhez
import { NextResponse } from "next/server";
import { getAuth } from "@/db/dbreq";
import { gate } from "@/db/permissions";
import { getDriveClient } from "@/db/autobackup";
import { dbreq } from "@/db/db";
import {
  getOriginalImagesFileID,
  upsertMediaImage,
  updateImagePreview,
} from "@/db/mediaPhotos";
import { isCached, writeCacheFile } from "@/lib/mediaCache";
import sharp from "sharp";
import { Readable } from "stream";

const ORIGINAL_MEDIA_FOLDER_ID =
  process.env.NEXT_PUBLIC_ORIGINAL_MEDIA_FOLDER_ID;
const PREVIEW_FOLDER_ID = process.env.NEXT_PUBLIC_MEDIA_FOLDER_ID;

const PREVIEW_CONFIG = {
  small: { height: 200, quality: 75 },
  large: { width: 1200, quality: 85 },
} as const;

// In-memory progress state
let batchProgress = {
  running: false,
  current: 0,
  total: 0,
  currentFile: "",
  phase: "" as string,
  options: {
    syncNew: false,
    generateColors: false,
    driveCache: false,
    localCache: false,
  },
  stats: {
    synced: 0,
    colorsGenerated: 0,
    driveCached: 0,
    localCached: 0,
  },
  errors: [] as string[],
  startedAt: null as Date | null,
};

/** Segéd: stream -> Buffer */
async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (c) => chunks.push(Buffer.from(c)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (err) =>
      reject(err instanceof Error ? err : new Error(String(err))),
    );
  });
}

/** Domináns szín számítás */
async function averageColorHex(buffer: Buffer): Promise<string | null> {
  try {
    const tiny = await sharp(buffer).resize(1, 1).raw().toBuffer();
    const r = tiny[0],
      g = tiny[1],
      b = tiny[2];
    const hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return `#${hex}`;
  } catch {
    return null;
  }
}

/** Preview generálás */
async function generatePreview(
  originalBuffer: Buffer,
  size: "small" | "large",
): Promise<{ buffer: Buffer; width: number; height: number }> {
  let sharpInstance = sharp(originalBuffer).rotate();

  if (size === "small") {
    sharpInstance = sharpInstance.resize({
      height: PREVIEW_CONFIG.small.height,
      withoutEnlargement: true,
    });
  } else {
    sharpInstance = sharpInstance.resize({
      width: PREVIEW_CONFIG.large.width,
      withoutEnlargement: true,
    });
  }

  const quality =
    size === "small"
      ? PREVIEW_CONFIG.small.quality
      : PREVIEW_CONFIG.large.quality;
  const buffer = await sharpInstance.webp({ quality }).toBuffer();
  const meta = await sharp(buffer).metadata();

  return {
    buffer,
    width: meta.width || 0,
    height: meta.height || 0,
  };
}

// GET: Progress lekérdezése
export async function GET() {
  return NextResponse.json(batchProgress);
}

// POST: Batch folyamat indítása
export async function POST(req: Request) {
  try {
    const selfUser = await getAuth();
    if (!selfUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    gate(selfUser, "admin");

    if (batchProgress.running) {
      return NextResponse.json(
        { error: "Batch process already in progress" },
        { status: 409 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const options = {
      syncNew: body.syncNew ?? true,
      generateColors: body.generateColors ?? true,
      driveCache: body.driveCache ?? true,
      localCache: body.localCache ?? false,
      sizes: (body.sizes as ("small" | "large")[]) ?? ["small", "large"],
    };

    // Aszinkron indítás
    (async () => {
      batchProgress = {
        running: true,
        current: 0,
        total: 0,
        currentFile: "Initializing...",
        phase: "init",
        options: {
          syncNew: options.syncNew,
          generateColors: options.generateColors,
          driveCache: options.driveCache,
          localCache: options.localCache,
        },
        stats: {
          synced: 0,
          colorsGenerated: 0,
          driveCached: 0,
          localCached: 0,
        },
        errors: [],
        startedAt: new Date(),
      };

      try {
        const drive = getDriveClient();

        // Összegyűjtjük a feldolgozandó képeket
        interface ImageToProcess {
          id: number | null; // null = új kép, még nincs DB-ben
          driveFileId: string;
          fileName: string;
          needsSync: boolean;
          needsColor: boolean;
          needsSmallDriveCache: boolean;
          needsLargeDriveCache: boolean;
          needsSmallLocalCache: boolean;
          needsLargeLocalCache: boolean;
        }

        const imagesToProcess: ImageToProcess[] = [];

        batchProgress.phase = "collecting";
        batchProgress.currentFile = "Collecting images to process...";

        // 1. Új képek a Drive-ról (ha syncNew be van kapcsolva)
        if (options.syncNew && ORIGINAL_MEDIA_FOLDER_ID) {
          let allDriveFiles: any[] = [];
          let pageToken: string | undefined;
          do {
            const listRes: any = await drive.files.list({
              q: `'${ORIGINAL_MEDIA_FOLDER_ID}' in parents and trashed=false and mimeType contains 'image/'`,
              fields: "nextPageToken, files(id, name, mimeType, createdTime)",
              pageSize: 1000,
              pageToken,
              supportsAllDrives: true,
              includeItemsFromAllDrives: true,
            });
            allDriveFiles = allDriveFiles.concat(listRes.data.files || []);
            pageToken = listRes.data.nextPageToken;
          } while (pageToken);

          const existingIds = new Set(await getOriginalImagesFileID());

          for (const file of allDriveFiles) {
            if (!existingIds.has(file.id)) {
              imagesToProcess.push({
                id: null,
                driveFileId: file.id,
                fileName: file.name,
                needsSync: true,
                needsColor: options.generateColors,
                needsSmallDriveCache:
                  options.driveCache && options.sizes.includes("small"),
                needsLargeDriveCache:
                  options.driveCache && options.sizes.includes("large"),
                needsSmallLocalCache:
                  options.localCache && options.sizes.includes("small"),
                needsLargeLocalCache:
                  options.localCache && options.sizes.includes("large"),
              });
            }
          }
        }

        // 2. Meglévő képek, amiknek hiányzik valami
        const existingImages = (await dbreq(
          `SELECT id, original_drive_id, original_file_name, color,
                  small_preview_drive_id, large_preview_drive_id
           FROM media_images`,
        )) as {
          id: number;
          original_drive_id: string;
          original_file_name: string;
          color: string | null;
          small_preview_drive_id: string | null;
          large_preview_drive_id: string | null;
        }[];

        for (const img of existingImages) {
          const needsColor = options.generateColors && !img.color;
          const needsSmallDriveCache =
            options.driveCache &&
            options.sizes.includes("small") &&
            !img.small_preview_drive_id;
          const needsLargeDriveCache =
            options.driveCache &&
            options.sizes.includes("large") &&
            !img.large_preview_drive_id;
          const needsSmallLocalCache =
            options.localCache &&
            options.sizes.includes("small") &&
            !isCached(img.id, "small");
          const needsLargeLocalCache =
            options.localCache &&
            options.sizes.includes("large") &&
            !isCached(img.id, "large");

          // Csak akkor adjuk hozzá, ha van teendő
          if (
            needsColor ||
            needsSmallDriveCache ||
            needsLargeDriveCache ||
            needsSmallLocalCache ||
            needsLargeLocalCache
          ) {
            imagesToProcess.push({
              id: img.id,
              driveFileId: img.original_drive_id,
              fileName: img.original_file_name,
              needsSync: false,
              needsColor,
              needsSmallDriveCache,
              needsLargeDriveCache,
              needsSmallLocalCache,
              needsLargeLocalCache,
            });
          }
        }

        batchProgress.total = imagesToProcess.length;
        batchProgress.phase = "processing";
        batchProgress.currentFile = `Found ${imagesToProcess.length} images to process`;

        // 3. Egyesével feldolgozás
        for (let i = 0; i < imagesToProcess.length; i++) {
          const img = imagesToProcess[i];
          batchProgress.current = i + 1;
          batchProgress.currentFile = img.fileName;

          try {
            // Letöltés az eredetiből
            const res: any = await drive.files.get(
              {
                fileId: img.driveFileId,
                alt: "media",
                supportsAllDrives: true,
              } as any,
              { responseType: "stream" } as any,
            );
            const originalBuffer = await streamToBuffer(res.data);

            let imageId = img.id;

            // A) Sync: DB-be mentés (új képeknél)
            if (img.needsSync) {
              const color = img.needsColor
                ? await averageColorHex(originalBuffer)
                : null;

              await upsertMediaImage(selfUser, {
                original_drive_id: img.driveFileId,
                original_file_name: img.fileName,
                color,
              });
              batchProgress.stats.synced++;
              if (color) batchProgress.stats.colorsGenerated++;

              // Lekérjük az új ID-t
              const [row] = (await dbreq(
                "SELECT id FROM media_images WHERE original_drive_id = ?",
                [img.driveFileId],
              )) as { id: number }[];
              imageId = row?.id ?? null;
            }

            // B) Szín generálás (meglévő képeknél, amiknek nincs)
            if (!img.needsSync && img.needsColor) {
              const color = await averageColorHex(originalBuffer);
              if (color && imageId) {
                await dbreq("UPDATE media_images SET color = ? WHERE id = ?", [
                  color,
                  imageId,
                ]);
                batchProgress.stats.colorsGenerated++;
              }
            }

            // C) Preview-k generálása és mentése
            if (imageId) {
              // Small preview
              if (img.needsSmallDriveCache || img.needsSmallLocalCache) {
                const smallPreview = await generatePreview(
                  originalBuffer,
                  "small",
                );

                if (img.needsSmallLocalCache) {
                  writeCacheFile(imageId, "small", smallPreview.buffer);
                  batchProgress.stats.localCached++;
                }

                if (img.needsSmallDriveCache && PREVIEW_FOLDER_ID) {
                  const previewName = `${img.fileName.replace(/\.[^/.]+$/, "")}_small.webp`;
                  const mediaStream = Readable.from(smallPreview.buffer);
                  const uploadRes: any = await drive.files.create(
                    {
                      requestBody: {
                        name: previewName,
                        parents: [PREVIEW_FOLDER_ID],
                        mimeType: "image/webp",
                      },
                      media: { mimeType: "image/webp", body: mediaStream },
                      supportsAllDrives: true,
                    } as any,
                    { fields: "id" } as any,
                  );
                  const driveId = uploadRes.data?.id;
                  if (driveId) {
                    await updateImagePreview(
                      imageId,
                      "small",
                      driveId,
                      smallPreview.width,
                      smallPreview.height,
                    );
                    batchProgress.stats.driveCached++;
                  }
                }
              }

              // Large preview
              if (img.needsLargeDriveCache || img.needsLargeLocalCache) {
                const largePreview = await generatePreview(
                  originalBuffer,
                  "large",
                );

                if (img.needsLargeLocalCache) {
                  writeCacheFile(imageId, "large", largePreview.buffer);
                  batchProgress.stats.localCached++;
                }

                if (img.needsLargeDriveCache && PREVIEW_FOLDER_ID) {
                  const previewName = `${img.fileName.replace(/\.[^/.]+$/, "")}_large.webp`;
                  const mediaStream = Readable.from(largePreview.buffer);
                  const uploadRes: any = await drive.files.create(
                    {
                      requestBody: {
                        name: previewName,
                        parents: [PREVIEW_FOLDER_ID],
                        mimeType: "image/webp",
                      },
                      media: { mimeType: "image/webp", body: mediaStream },
                      supportsAllDrives: true,
                    } as any,
                    { fields: "id" } as any,
                  );
                  const driveId = uploadRes.data?.id;
                  if (driveId) {
                    await updateImagePreview(
                      imageId,
                      "large",
                      driveId,
                      largePreview.width,
                      largePreview.height,
                    );
                    batchProgress.stats.driveCached++;
                  }
                }
              }
            }

            // Memória felszabadítás - az originalBuffer kikerül a scope-ból
          } catch (error: any) {
            batchProgress.errors.push(`${img.fileName}: ${error.message}`);
          }
        }

        batchProgress.phase = "done";
        batchProgress.currentFile = "Done!";
      } catch (error: any) {
        batchProgress.errors.push(`Fatal error: ${error.message}`);
        batchProgress.phase = "error";
      } finally {
        batchProgress.running = false;
      }
    })();

    return NextResponse.json({
      message: "Batch process started",
      progress: batchProgress,
    });
  } catch (error: any) {
    console.error("[admin/media/batch] Error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 },
    );
  }
}
