import { NextResponse } from "next/server";
import { getAuth } from "@/db/dbreq";
import { gate } from "@/db/permissions";
import { getDriveClient } from "@/db/autobackup";
import { dbreq } from "@/db/db";
import { isCached, writeCacheFile } from "@/lib/mediaCache";
import sharp from "sharp";
import {
  startOperation,
  isOperationRunning,
  setTotal,
  setCurrent,
  setCurrentFile,
  addError,
  completeOperation,
  failOperation,
  getGlobalProgress,
} from "@/lib/globalProgress";
import { processInParallel } from "@/lib/parallelProcessor";

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
  return NextResponse.json(getGlobalProgress());
}

// POST: Lokális cache indítása
export async function POST(req: Request) {
  try {
    const selfUser = await getAuth();
    if (!selfUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    gate(selfUser, ["admin", "media_admin"]);

    if (isOperationRunning()) {
      return NextResponse.json(
        { error: "Local caching already in progress" },
        { status: 409 },
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
      if (!startOperation("cache-local", { size })) {
        return;
      }

      try {
        const drive = getDriveClient();

        setCurrentFile("Fetching all images...");

        // Minden kép
        const images = (await dbreq(
          "SELECT id, original_drive_id, original_file_name, small_preview_drive_id, large_preview_drive_id FROM media_images",
        )) as {
          id: number;
          original_drive_id: string;
          original_file_name: string;
          small_preview_drive_id?: string;
          large_preview_drive_id?: string;
        }[];

        // Csak azok, amik nincsenek cache-elve
        const notCached = images.filter((img) => !isCached(img.id, size));

        setTotal(notCached.length);
        setCurrentFile(`Found ${notCached.length} images not in local cache`);

        await processInParallel(
          notCached,
          async (image, index) => {
            setCurrent(index + 1);
            setCurrentFile(
              image.original_file_name || `ID: ${image.id}`,
            );

            try {
              let previewBuffer: Buffer;

              // Először próbáljuk a Drive preview-ból
              const previewDriveId =
                size === "small"
                  ? image.small_preview_drive_id
                  : image.large_preview_drive_id;

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
              }

              // Mentés lokális cache-be
              writeCacheFile(image.id, size, previewBuffer);
            } catch (error: any) {
              addError(
                `${image.original_file_name || image.id}: ${error.message}`,
              );
            }
          },
        );

        completeOperation("Done!");
      } catch (error: any) {
        failOperation(`Fatal error: ${error.message}`);
      }
    })();

    return NextResponse.json({
      message: "Local caching started",
      progress: getGlobalProgress(),
    });
  } catch (error: any) {
    console.error("[admin/media/cache-local] Error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 },
    );
  }
}
