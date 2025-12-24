// app/api/syncMediaImages/route.ts
// Ez az API szinkronizálja a Drive mappából az eredeti képeket a DB-be.
// A preview generálás lazy módon történik az /api/media/[id] endpointon.

import { NextResponse } from "next/server";
import { getDriveClient } from "@/db/autobackup";
import { getOriginalImagesFileID, upsertMediaImage } from "@/db/mediaPhotos";
import { getAuth } from "@/db/dbreq";
import { gate } from "@/db/permissions";
import sharp from "sharp";

const ORIGINAL_MEDIA_FOLDER_ID =
  process.env.NEXT_PUBLIC_ORIGINAL_MEDIA_FOLDER_ID;

// In-memory lock
let isProcessing = false;
let lastRunStartTs: number | null = null;

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

/** Számolja/visszaadja a kép "domináns" színét 1x1 resize-szel (hex) */
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

async function processOneImage(
  drive: any,
  f: any,
  idx: number,
  total: number,
  selfUser: any,
): Promise<{ result: any; success: boolean }> {
  const fileId = f.id as string | undefined;
  const fileName = (f.name as string | undefined) ?? "image";
  const itemStart = Date.now();

  try {
    if (!fileId) {
      return {
        result: {
          original: { id: f.id, name: f.name },
          error: "Missing fileId",
        },
        success: false,
      };
    }

    console.log(
      `[syncMediaImages] (${idx + 1}/${total}) Processing: ${fileName} [${fileId}]`,
    );

    // Letöltjük a képet csak a domináns szín kiszámításához
    // (Kis méretű sample elég, nem kell a teljes kép)
    console.log("[syncMediaImages]  - Downloading for color analysis...");
    const res: any = await drive.files.get(
      { fileId, alt: "media", supportsAllDrives: true } as any,
      { responseType: "stream" } as any,
    );
    const fileBuffer = await streamToBuffer(res.data);
    console.log(`[syncMediaImages]    ✓ Downloaded ${fileBuffer.length} bytes`);

    // Domináns szín kiszámítása
    console.log("[syncMediaImages]  - Computing dominant color...");
    const color = await averageColorHex(fileBuffer);
    if (color) console.log(`[syncMediaImages]    ✓ Dominant color: ${color}`);

    // DB upsert - csak az eredeti kép adatait mentjük
    console.log("[syncMediaImages]  - Upserting DB record...");
    await upsertMediaImage(selfUser, {
      original_drive_id: fileId,
      original_file_name: fileName,
      color,
    });
    console.log("[syncMediaImages]    ✓ DB upsert done");

    const itemDur = Date.now() - itemStart;
    console.log(
      `[syncMediaImages] (${idx + 1}/${total}) DONE: ${fileName} in ${itemDur} ms`,
    );

    return {
      result: {
        original: { id: fileId, name: fileName },
        color,
      },
      success: true,
    };
  } catch (err: any) {
    const itemDur = Date.now() - itemStart;
    console.error(
      `[syncMediaImages] (${idx + 1}/${total}) ERROR processing ${fileName} after ${itemDur} ms:`,
      err,
    );
    return {
      result: {
        original: { id: f.id, name: f.name },
        error: String(err?.message ?? err),
      },
      success: false,
    };
  }
}

export async function GET(req: Request) {
  if (process.env.LITE_MODE === "true") {
    return NextResponse.json(
      { error: "Not available in LITE_MODE" },
      { status: 403 },
    );
  }

  console.log("[syncMediaImages] START: Checking auth and env...");
  const selfUser = await getAuth();
  if (!selfUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!gate(selfUser, "e5media", "boolean")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!ORIGINAL_MEDIA_FOLDER_ID) {
    return NextResponse.json(
      { error: "Missing ORIGINAL_MEDIA_FOLDER_ID in env" },
      { status: 400 },
    );
  }

  // Concurrency guard
  if (isProcessing) {
    console.warn(
      "[syncMediaImages] BLOCKED: A previous run is still in progress.",
    );
    return NextResponse.json(
      {
        error: "Already running",
        startedAt: lastRunStartTs,
        message: "A previous run is still in progress. Try again later.",
      },
      { status: 429 },
    );
  }

  isProcessing = true;
  const startedAt = Date.now();
  lastRunStartTs = startedAt;

  try {
    // Meglévő képek lekérése
    console.log("[syncMediaImages] Fetching existing original IDs from DB...");
    const existingDriveIds = await getOriginalImagesFileID();
    console.log(
      `[syncMediaImages] Known original IDs: ${existingDriveIds.length}`,
    );

    // Drive client inicializálás
    let drive;
    try {
      console.log("[syncMediaImages] Initializing Google Drive client...");
      drive = getDriveClient();
    } catch (e: any) {
      return NextResponse.json(
        {
          error: "Google Drive service account configuration error",
          detail: String(e?.message ?? e),
        },
        { status: 500 },
      );
    }

    // Mappa elérhetőség ellenőrzése
    let folderDriveId: string | undefined;
    try {
      const folderMeta = await drive.files.get({
        fileId: ORIGINAL_MEDIA_FOLDER_ID,
        fields: "id,name,driveId",
        supportsAllDrives: true,
      });
      folderDriveId = (folderMeta.data as any)?.driveId;
      console.log(
        "[syncMediaImages] Original folder accessible:",
        folderMeta.data.name,
      );
    } catch (e) {
      console.warn("[syncMediaImages] Original folder not accessible:", e);
    }

    // Listázás
    const listParams: any = {
      q: `'${ORIGINAL_MEDIA_FOLDER_ID}' in parents and trashed=false`,
      fields: "files(id,name,mimeType,createdTime)",
      pageSize: 100,
      orderBy: "createdTime desc",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      spaces: "drive",
    };
    if (folderDriveId) {
      listParams.corpora = "drive";
      listParams.driveId = folderDriveId;
    } else {
      listParams.corpora = "allDrives";
    }

    console.log("[syncMediaImages] Listing files in original folder...");
    const filesList = await drive.files.list(listParams);

    const allImages =
      filesList.data.files?.filter((f: any) =>
        f.mimeType?.startsWith("image/"),
      ) || [];

    const newImages = allImages.filter(
      (f: any) => !existingDriveIds.includes(f.id ?? ""),
    );

    console.log(
      `[syncMediaImages] Images found: ${allImages.length}, new to process: ${newImages.length}`,
    );

    if (newImages.length === 0) {
      const durationMs = Date.now() - startedAt;
      console.log(
        `[syncMediaImages] DONE: No new images. Duration: ${durationMs} ms`,
      );
      return NextResponse.json({
        message: "No new images to process",
        checked: allImages.length,
        durationMs,
      });
    }

    // Feldolgozás
    const results: any[] = [];
    let successCount = 0;
    let errorCount = 0;

    for (let idx = 0; idx < newImages.length; idx++) {
      const r = await processOneImage(
        drive,
        newImages[idx],
        idx,
        newImages.length,
        selfUser,
      );
      results.push(r.result);
      if (r.success) successCount++;
      else errorCount++;
    }

    const durationMs = Date.now() - startedAt;
    console.log(
      `[syncMediaImages] DONE: processed=${results.length}, success=${successCount}, errors=${errorCount}, duration=${durationMs} ms`,
    );

    return NextResponse.json({
      processed: results.length,
      success: successCount,
      errors: errorCount,
      durationMs,
      details: results,
    });
  } finally {
    isProcessing = false;
    lastRunStartTs = null;
    console.log("[syncMediaImages] RELEASED lock");
  }
}

export async function POST(req: Request) {
  return GET(req);
}
