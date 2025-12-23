// app/api/admin/media/extract-exif/route.ts
// EXIF datetime kinyerése a meglévő képekből (ahol datetime NULL)
import { NextResponse } from "next/server";
import { getAuth } from "@/db/dbreq";
import { gate } from "@/db/permissions";
import { getDriveClient } from "@/db/autobackup";
import { dbreq } from "@/db/db";
import sharp from "sharp";

// In-memory progress state
let exifProgress = {
  running: false,
  current: 0,
  total: 0,
  currentFile: "",
  stats: {
    extracted: 0,
    noExif: 0,
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

/** Kinyeri a kép készítésének időpontját az EXIF adatokból */
async function extractExifDatetime(buffer: Buffer): Promise<string | null> {
  try {
    const metadata = await sharp(buffer).metadata();
    if (metadata.exif) {
      const ExifReader = await import("exifreader");
      const tags = ExifReader.load(buffer);

      const dateFields = [
        "DateTimeOriginal",
        "CreateDate",
        "DateTime",
        "DateTimeDigitized",
      ];

      for (const field of dateFields) {
        if (tags[field]?.description) {
          const exifDate = tags[field].description;
          // EXIF formátum: "2024:12:23 14:30:00" -> ISO formátum
          const isoDate = exifDate
            .replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3")
            .replace(" ", "T");
          return isoDate;
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

// GET: Progress lekérdezése
export async function GET() {
  return NextResponse.json(exifProgress);
}

// POST: EXIF kinyerés indítása
export async function POST(req: Request) {
  try {
    const selfUser = await getAuth();
    if (!selfUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    gate(selfUser, ["admin", "media_admin"]);

    if (exifProgress.running) {
      return NextResponse.json(
        { error: "EXIF extraction already in progress" },
        { status: 409 },
      );
    }

    // Opcionális: forceAll paraméter - minden képet újra feldolgoz
    const { forceAll = false } = await req.json().catch(() => ({}));

    // Aszinkron indítás
    (async () => {
      exifProgress = {
        running: true,
        current: 0,
        total: 0,
        currentFile: "Fetching images...",
        stats: {
          extracted: 0,
          noExif: 0,
        },
        errors: [],
        startedAt: new Date(),
      };

      try {
        const drive = getDriveClient();

        // Képek datetime nélkül (vagy mindegyik ha forceAll)
        const query = forceAll
          ? "SELECT id, original_drive_id, original_file_name FROM media_images"
          : "SELECT id, original_drive_id, original_file_name FROM media_images WHERE datetime IS NULL";

        const images = (await dbreq(query)) as {
          id: number;
          original_drive_id: string;
          original_file_name: string;
        }[];

        exifProgress.total = images.length;
        exifProgress.currentFile = `Found ${images.length} images to process`;

        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          exifProgress.current = i + 1;
          exifProgress.currentFile =
            image.original_file_name || `ID: ${image.id}`;

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
            const datetime = await extractExifDatetime(buffer);

            if (datetime) {
              await dbreq("UPDATE media_images SET datetime = ? WHERE id = ?", [
                datetime,
                image.id,
              ]);
              exifProgress.stats.extracted++;
            } else {
              exifProgress.stats.noExif++;
            }
          } catch (error: any) {
            exifProgress.errors.push(
              `${image.original_file_name || image.id}: ${error.message}`,
            );
          }
        }

        exifProgress.currentFile = "Done!";
      } catch (error: any) {
        exifProgress.errors.push(`Fatal error: ${error.message}`);
      } finally {
        exifProgress.running = false;
      }
    })();

    return NextResponse.json({
      message: "EXIF extraction started",
      progress: exifProgress,
    });
  } catch (error: any) {
    console.error("[admin/media/extract-exif] Error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 },
    );
  }
}
