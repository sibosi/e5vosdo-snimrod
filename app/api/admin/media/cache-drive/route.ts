// app/api/admin/media/cache-drive/route.ts
// Preview képek feltöltése Drive-ra (backup)
import { NextResponse } from "next/server";
import { getAuth } from "@/db/dbreq";
import { gate } from "@/db/permissions";
import { getDriveClient } from "@/db/autobackup";
import { dbreq } from "@/db/db";
import { updateImagePreview } from "@/db/mediaPhotos";
import { isCached, readCachedFile } from "@/lib/mediaCache";
import sharp from "sharp";
import { Readable } from "stream";

const PREVIEW_FOLDER_ID = process.env.NEXT_PUBLIC_MEDIA_FOLDER_ID;

const PREVIEW_CONFIG = {
  small: {
    height: 200,
    quality: 75,
  },
  large: {
    width: 1200,
    quality: 85,
  },
} as const;

// In-memory progress state
let cacheProgress = {
  running: false,
  current: 0,
  total: 0,
  currentFile: "",
  size: "small" as "small" | "large",
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

// GET: Progress lekérdezése
export async function GET() {
  return NextResponse.json(cacheProgress);
}

// POST: Drive cache indítása
export async function POST(req: Request) {
  try {
    const selfUser = await getAuth();
    if (!selfUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    gate(selfUser, ["admin", "media_admin"]);

    if (cacheProgress.running) {
      return NextResponse.json(
        { error: "Drive caching already in progress" },
        { status: 409 },
      );
    }

    if (!PREVIEW_FOLDER_ID) {
      return NextResponse.json(
        { error: "PREVIEW_FOLDER_ID not configured" },
        { status: 500 },
      );
    }

    const { size: rawSize = "small" } = await req.json().catch(() => ({}));
    if (rawSize !== "small" && rawSize !== "large") {
      return NextResponse.json(
        { error: "Invalid size parameter" },
        { status: 400 },
      );
    }
    const size: "small" | "large" = rawSize;

    // Aszinkron indítás
    (async () => {
      cacheProgress = {
        running: true,
        current: 0,
        total: 0,
        currentFile: "Fetching images without Drive preview...",
        size,
        errors: [],
        startedAt: new Date(),
      };

      try {
        const drive = getDriveClient();

        // Képek Drive preview nélkül
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

        cacheProgress.total = images.length;
        cacheProgress.currentFile = `Found ${images.length} images without ${size} Drive preview`;

        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          cacheProgress.current = i + 1;
          cacheProgress.currentFile =
            image.original_file_name || `ID: ${image.id}`;

          try {
            let previewBuffer: Buffer;
            let width: number;
            let height: number;

            // Először próbáljuk a lokális cache-ből
            if (isCached(image.id, size)) {
              previewBuffer = readCachedFile(image.id, size)!;
              const meta = await sharp(previewBuffer).metadata();
              width = meta.width || 0;
              height = meta.height || 0;
            } else {
              // Generálás az eredetiből
              const res: any = await drive.files.get(
                {
                  fileId: image.original_drive_id,
                  alt: "media",
                  supportsAllDrives: true,
                } as any,
                { responseType: "stream" } as any,
              );
              const originalBuffer = await streamToBuffer(res.data);

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
              previewBuffer = await sharpInstance.webp({ quality }).toBuffer();
              const meta = await sharp(previewBuffer).metadata();
              width = meta.width || 0;
              height = meta.height || 0;
            }

            // Feltöltés Drive-ra
            const previewName = `${(
              image.original_file_name || "image"
            ).replace(/\.[^/.]+$/, "")}_${size}.webp`;
            const mediaStream = Readable.from(previewBuffer);

            const uploadRes: any = await drive.files.create(
              {
                requestBody: {
                  name: previewName,
                  parents: [PREVIEW_FOLDER_ID],
                  mimeType: "image/webp",
                },
                media: {
                  mimeType: "image/webp",
                  body: mediaStream,
                },
                supportsAllDrives: true,
              } as any,
              { fields: "id" } as any,
            );

            const driveId = uploadRes.data?.id as string | undefined;
            if (driveId) {
              await updateImagePreview(image.id, size, driveId, width, height);
            }
          } catch (error: any) {
            cacheProgress.errors.push(
              `${image.original_file_name || image.id}: ${error.message}`,
            );
          }
        }

        cacheProgress.currentFile = "Done!";
      } catch (error: any) {
        cacheProgress.errors.push(`Fatal error: ${error.message}`);
      } finally {
        cacheProgress.running = false;
      }
    })();

    return NextResponse.json({
      message: "Drive caching started",
      progress: cacheProgress,
    });
  } catch (error: any) {
    console.error("[admin/media/cache-drive] Error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 },
    );
  }
}
