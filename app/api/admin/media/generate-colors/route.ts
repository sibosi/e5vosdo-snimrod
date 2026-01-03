// app/api/admin/media/generate-colors/route.ts
// Színek generálása a meglévő képekhez (SSE progress)
import { NextResponse } from "next/server";
import { getAuth } from "@/db/dbreq";
import { gate } from "@/db/permissions";
import { getDriveClient } from "@/db/autobackup";
import { dbreq } from "@/db/db";
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

/** Számolja a domináns színt */
async function averageColorHex(buffer: Buffer): Promise<string | null> {
  try {
    const tiny = await sharp(buffer).resize(1, 1).raw().toBuffer();
    const r = tiny[0],
      g = tiny[1],
      b = tiny[2];
    const hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return `#${hex}`;
  } catch (e) {
    console.warn("averageColorHex failed:", e);
    return null;
  }
}

// GET: Progress lekérdezése
export async function GET() {
  return NextResponse.json(getGlobalProgress());
}

// POST: Szín generálás indítása
export async function POST() {
  try {
    const selfUser = await getAuth();
    if (!selfUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    gate(selfUser, ["admin", "media_admin"]);

    if (isOperationRunning()) {
      return NextResponse.json(
        { error: "Color generation already in progress" },
        { status: 409 },
      );
    }

    // Aszinkron indítás
    (async () => {
      if (!startOperation("generate-colors")) {
        return;
      }

      try {
        const drive = getDriveClient();

        // Képek szín nélkül
        const images = (await dbreq(
          "SELECT id, original_drive_id, original_file_name FROM media_images WHERE color IS NULL",
        )) as {
          id: number;
          original_drive_id: string;
          original_file_name: string;
        }[];

        setTotal(images.length);
        setCurrentFile(`Found ${images.length} images without color`);

        await processInParallel(
          images,
          async (image, index) => {
            setCurrent(index + 1);
            setCurrentFile(
              image.original_file_name || `ID: ${image.id}`,
            );

            try {
              // Letöltés
              const res: any = await drive.files.get(
                {
                  fileId: image.original_drive_id,
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
                  image.id,
                ]);
              }
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
      message: "Color generation started",
      progress: getGlobalProgress(),
    });
  } catch (error: any) {
    console.error("[admin/media/generate-colors] Error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 },
    );
  }
}
