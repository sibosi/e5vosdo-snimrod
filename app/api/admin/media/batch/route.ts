// app/api/admin/media/batch/route.ts
// Összevont műveletek - egy letöltéssel több feladat
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

        // ========== 1. FÁZIS: Új képek szinkronizálása ==========
        if (options.syncNew && ORIGINAL_MEDIA_FOLDER_ID) {
          batchProgress.phase = "sync";
          batchProgress.currentFile = "Fetching new images from Drive...";

          // Drive-ból listázás
          let allFiles: any[] = [];
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
            allFiles = allFiles.concat(listRes.data.files || []);
            pageToken = listRes.data.nextPageToken;
          } while (pageToken);

          const existingIds = new Set(await getOriginalImagesFileID());
          const newFiles = allFiles.filter((f) => !existingIds.has(f.id));

          for (let i = 0; i < newFiles.length; i++) {
            const file = newFiles[i];
            batchProgress.current = i + 1;
            batchProgress.total = newFiles.length;
            batchProgress.currentFile = `[Sync] ${file.name}`;

            try {
              // Letöltés
              const res: any = await drive.files.get(
                {
                  fileId: file.id,
                  alt: "media",
                  supportsAllDrives: true,
                } as any,
                { responseType: "stream" } as any,
              );
              const originalBuffer = await streamToBuffer(res.data);

              // Szín számítás
              const color = await averageColorHex(originalBuffer);

              // DB upsert
              await upsertMediaImage(selfUser, {
                original_drive_id: file.id,
                original_file_name: file.name,
                color,
              });
              batchProgress.stats.synced++;

              // Ha kell Drive/Local cache is, azonnal csináljuk
              if (options.driveCache || options.localCache) {
                // Lekérjük az image ID-t
                const [row] = (await dbreq(
                  "SELECT id FROM media_images WHERE original_drive_id = ?",
                  [file.id],
                )) as { id: number }[];

                if (row) {
                  for (const size of options.sizes) {
                    const preview = await generatePreview(originalBuffer, size);

                    if (options.localCache) {
                      writeCacheFile(row.id, size, preview.buffer);
                      batchProgress.stats.localCached++;
                    }

                    if (options.driveCache && PREVIEW_FOLDER_ID) {
                      const previewName = `${file.name.replace(/\.[^/.]+$/, "")}_${size}.webp`;
                      const mediaStream = Readable.from(preview.buffer);
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
                          row.id,
                          size,
                          driveId,
                          preview.width,
                          preview.height,
                        );
                        batchProgress.stats.driveCached++;
                      }
                    }
                  }
                }
              }
            } catch (error: any) {
              batchProgress.errors.push(
                `[Sync] ${file.name}: ${error.message}`,
              );
            }
          }
        }

        // ========== 2. FÁZIS: Hiányzó színek ==========
        if (options.generateColors) {
          batchProgress.phase = "colors";
          batchProgress.currentFile = "Finding images without color...";

          const imagesWithoutColor = (await dbreq(
            "SELECT id, original_drive_id, original_file_name FROM media_images WHERE color IS NULL",
          )) as {
            id: number;
            original_drive_id: string;
            original_file_name: string;
          }[];

          batchProgress.total = imagesWithoutColor.length;

          for (let i = 0; i < imagesWithoutColor.length; i++) {
            const img = imagesWithoutColor[i];
            batchProgress.current = i + 1;
            batchProgress.currentFile = `[Color] ${img.original_file_name || img.id}`;

            try {
              const res: any = await drive.files.get(
                {
                  fileId: img.original_drive_id,
                  alt: "media",
                  supportsAllDrives: true,
                } as any,
                { responseType: "stream" } as any,
              );
              const buffer = await streamToBuffer(res.data);
              const color = await averageColorHex(buffer);

              if (color) {
                await dbreq("UPDATE media_images SET color = ? WHERE id = ?", [
                  color,
                  img.id,
                ]);
                batchProgress.stats.colorsGenerated++;
              }

              // Kihasználjuk, hogy már letöltöttük - preview-k
              if (options.driveCache || options.localCache) {
                for (const size of options.sizes) {
                  const needsDrive =
                    options.driveCache &&
                    PREVIEW_FOLDER_ID &&
                    !(await hasPreviewOnDrive(img.id, size));
                  const needsLocal =
                    options.localCache && !isCached(img.id, size);

                  if (needsDrive || needsLocal) {
                    const preview = await generatePreview(buffer, size);

                    if (needsLocal) {
                      writeCacheFile(img.id, size, preview.buffer);
                      batchProgress.stats.localCached++;
                    }

                    if (needsDrive && PREVIEW_FOLDER_ID) {
                      const previewName = `${(img.original_file_name || "image").replace(/\.[^/.]+$/, "")}_${size}.webp`;
                      const mediaStream = Readable.from(preview.buffer);
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
                          img.id,
                          size,
                          driveId,
                          preview.width,
                          preview.height,
                        );
                        batchProgress.stats.driveCached++;
                      }
                    }
                  }
                }
              }
            } catch (error: any) {
              batchProgress.errors.push(
                `[Color] ${img.original_file_name || img.id}: ${error.message}`,
              );
            }
          }
        }

        // ========== 3. FÁZIS: Hiányzó Drive cache ==========
        if (options.driveCache && PREVIEW_FOLDER_ID) {
          batchProgress.phase = "drive-cache";
          batchProgress.currentFile = "Finding images without Drive preview...";

          for (const size of options.sizes) {
            const column =
              size === "small"
                ? "small_preview_drive_id"
                : "large_preview_drive_id";
            const images = (await dbreq(
              `SELECT id, original_drive_id, original_file_name FROM media_images WHERE ${column} IS NULL`,
            )) as {
              id: number;
              original_drive_id: string;
              original_file_name: string;
            }[];

            batchProgress.total = images.length;

            for (let i = 0; i < images.length; i++) {
              const img = images[i];
              batchProgress.current = i + 1;
              batchProgress.currentFile = `[Drive ${size}] ${img.original_file_name || img.id}`;

              try {
                let previewBuffer: Buffer;
                let width: number;
                let height: number;

                // Először lokális cache-ből
                if (isCached(img.id, size)) {
                  const cached = await import("@/lib/mediaCache").then((m) =>
                    m.readCachedFile(img.id, size),
                  );
                  if (cached) {
                    previewBuffer = cached;
                    const meta = await sharp(cached).metadata();
                    width = meta.width || 0;
                    height = meta.height || 0;
                  } else {
                    continue;
                  }
                } else {
                  // Letöltés és generálás
                  const res: any = await drive.files.get(
                    {
                      fileId: img.original_drive_id,
                      alt: "media",
                      supportsAllDrives: true,
                    } as any,
                    { responseType: "stream" } as any,
                  );
                  const originalBuffer = await streamToBuffer(res.data);
                  const preview = await generatePreview(originalBuffer, size);
                  previewBuffer = preview.buffer;
                  width = preview.width;
                  height = preview.height;

                  // Mentés lokálba is ha kell
                  if (options.localCache) {
                    writeCacheFile(img.id, size, previewBuffer);
                    batchProgress.stats.localCached++;
                  }
                }

                // Feltöltés Drive-ra
                const previewName = `${(img.original_file_name || "image").replace(/\.[^/.]+$/, "")}_${size}.webp`;
                const mediaStream = Readable.from(previewBuffer);
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
                    img.id,
                    size,
                    driveId,
                    width,
                    height,
                  );
                  batchProgress.stats.driveCached++;
                }
              } catch (error: any) {
                batchProgress.errors.push(
                  `[Drive ${size}] ${img.original_file_name || img.id}: ${error.message}`,
                );
              }
            }
          }
        }

        // ========== 4. FÁZIS: Hiányzó lokális cache ==========
        if (options.localCache) {
          batchProgress.phase = "local-cache";
          batchProgress.currentFile = "Finding images not in local cache...";

          const allImages = (await dbreq(
            "SELECT id, original_drive_id, original_file_name, small_preview_drive_id, large_preview_drive_id FROM media_images",
          )) as {
            id: number;
            original_drive_id: string;
            original_file_name: string;
            small_preview_drive_id?: string;
            large_preview_drive_id?: string;
          }[];

          for (const size of options.sizes) {
            const notCached = allImages.filter(
              (img) => !isCached(img.id, size),
            );
            batchProgress.total = notCached.length;

            for (let i = 0; i < notCached.length; i++) {
              const img = notCached[i];
              batchProgress.current = i + 1;
              batchProgress.currentFile = `[Local ${size}] ${img.original_file_name || img.id}`;

              try {
                let previewBuffer: Buffer;

                // Először Drive preview-ból
                const previewDriveId =
                  size === "small"
                    ? img.small_preview_drive_id
                    : img.large_preview_drive_id;

                if (previewDriveId) {
                  const res: any = await drive.files.get(
                    {
                      fileId: previewDriveId,
                      alt: "media",
                      supportsAllDrives: true,
                    } as any,
                    { responseType: "stream" } as any,
                  );
                  previewBuffer = await streamToBuffer(res.data);
                } else {
                  // Generálás az eredetiből
                  const res: any = await drive.files.get(
                    {
                      fileId: img.original_drive_id,
                      alt: "media",
                      supportsAllDrives: true,
                    } as any,
                    { responseType: "stream" } as any,
                  );
                  const originalBuffer = await streamToBuffer(res.data);
                  const preview = await generatePreview(originalBuffer, size);
                  previewBuffer = preview.buffer;
                }

                writeCacheFile(img.id, size, previewBuffer);
                batchProgress.stats.localCached++;
              } catch (error: any) {
                batchProgress.errors.push(
                  `[Local ${size}] ${img.original_file_name || img.id}: ${error.message}`,
                );
              }
            }
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

/** Segéd: van-e már Drive preview */
async function hasPreviewOnDrive(
  imageId: number,
  size: "small" | "large",
): Promise<boolean> {
  const column =
    size === "small" ? "small_preview_drive_id" : "large_preview_drive_id";
  const result = (await dbreq(
    `SELECT ${column} FROM media_images WHERE id = ?`,
    [imageId],
  )) as { [key: string]: string | null }[];
  return result.length > 0 && result[0][column] !== null;
}
