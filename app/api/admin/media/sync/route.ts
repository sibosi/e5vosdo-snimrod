// app/api/admin/media/sync/route.ts
// Drive képek szinkronizálása az adatbázisba (SSE progress)
import { NextResponse } from "next/server";
import { getAuth } from "@/db/dbreq";
import { gate } from "@/db/permissions";
import { getDriveClient } from "@/db/autobackup";
import { getOriginalImagesFileID, upsertMediaImage } from "@/db/mediaPhotos";
import sharp from "sharp";

const ORIGINAL_MEDIA_FOLDER_ID =
  process.env.NEXT_PUBLIC_ORIGINAL_MEDIA_FOLDER_ID;

// In-memory progress state
let syncProgress = {
  running: false,
  current: 0,
  total: 0,
  currentFile: "",
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

/** Kinyeri a kép készítésének időpontját az EXIF adatokból */
async function extractExifDatetime(buffer: Buffer): Promise<string | null> {
  try {
    const metadata = await sharp(buffer).metadata();
    // Sharp az exif-et nyers buffer-ként adja vissza, de van DateTimeOriginal/CreateDate
    // Ha az exif mezők közvetlenül elérhetők:
    if (metadata.exif) {
      // EXIF buffer parse-olása
      const ExifReader = await import("exifreader");
      const tags = ExifReader.load(buffer);

      // Próbáljuk kinyerni a dátumot különböző mezőkből
      const dateFields = [
        "DateTimeOriginal",
        "CreateDate",
        "DateTime",
        "DateTimeDigitized",
      ];

      for (const field of dateFields) {
        if (tags[field]?.description) {
          // EXIF formátum: "2024:12:23 14:30:00" -> ISO formátum
          const exifDate = tags[field].description;
          // Átalakítás ISO formátumra
          const isoDate = exifDate
            .replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3")
            .replace(" ", "T");
          return isoDate;
        }
      }
    }
    return null;
  } catch (e) {
    console.warn("extractExifDatetime failed:", e);
    return null;
  }
}

// GET: Progress lekérdezése
export async function GET() {
  return NextResponse.json(syncProgress);
}

// POST: Szinkronizálás indítása
export async function POST(req: Request) {
  try {
    const selfUser = await getAuth();
    if (!selfUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    gate(selfUser, ["admin", "media_admin"]);

    if (syncProgress.running) {
      return NextResponse.json(
        { error: "Sync already in progress" },
        { status: 409 },
      );
    }

    if (!ORIGINAL_MEDIA_FOLDER_ID) {
      return NextResponse.json(
        { error: "ORIGINAL_MEDIA_FOLDER_ID not configured" },
        { status: 500 },
      );
    }

    // Opcionális: withColors paraméter
    const { withColors = true } = await req.json().catch(() => ({}));

    // Aszinkron indítás
    (async () => {
      syncProgress = {
        running: true,
        current: 0,
        total: 0,
        currentFile: "Fetching file list...",
        errors: [],
        startedAt: new Date(),
      };

      try {
        const drive = getDriveClient();

        // Képek listázása a Drive mappából
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

        // Már meglévő képek kiszűrése
        const existingIds = new Set(await getOriginalImagesFileID());
        const newFiles = allFiles.filter((f) => !existingIds.has(f.id));

        syncProgress.total = newFiles.length;
        syncProgress.currentFile = `Found ${newFiles.length} new images`;

        for (let i = 0; i < newFiles.length; i++) {
          const file = newFiles[i];
          syncProgress.current = i + 1;
          syncProgress.currentFile = file.name;

          try {
            let color: string | null = null;
            let datetime: string | null = null;

            // Mindig letöltjük a képet, hogy kinyerjük az EXIF dátumot
            const res: any = await drive.files.get(
              {
                fileId: file.id,
                alt: "media",
                supportsAllDrives: true,
              } as any,
              { responseType: "stream" } as any,
            );
            const buffer = await streamToBuffer(res.data);

            // EXIF datetime kinyerése (kép készítésének időpontja)
            datetime = await extractExifDatetime(buffer);

            // Domináns szín számítása (opcionális)
            if (withColors) {
              color = await averageColorHex(buffer);
            }

            await upsertMediaImage(selfUser, {
              original_drive_id: file.id,
              original_file_name: file.name,
              color,
              datetime, // EXIF capture time
              upload_datetime: file.createdTime, // Drive upload time
            });
          } catch (error: any) {
            syncProgress.errors.push(`${file.name}: ${error.message}`);
          }
        }

        syncProgress.currentFile = "Done!";
      } catch (error: any) {
        syncProgress.errors.push(`Fatal error: ${error.message}`);
      } finally {
        syncProgress.running = false;
      }
    })();

    return NextResponse.json({
      message: "Sync started",
      progress: syncProgress,
    });
  } catch (error: any) {
    console.error("[admin/media/sync] Error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 },
    );
  }
}
