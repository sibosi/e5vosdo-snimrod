// app/api/drive-sync/route.ts
import { NextResponse } from "next/server";
import { getDriveClient } from "@/db/autobackup";
import { getOriginalImagesFileID, upsertMediaImage } from "@/db/mediaPhotos";
import sharp from "sharp";
import { Readable } from "stream";
import { getAuth } from "@/db/dbreq";
import { cpus } from "os";
import { gate } from "@/db/permissions";

const ORIGINAL_MEDIA_FOLDER_ID =
  process.env.NEXT_PUBLIC_ORIGINAL_MEDIA_FOLDER_ID;
const COMPRESSED_MEDIA_FOLDER_ID = process.env.NEXT_PUBLIC_MEDIA_FOLDER_ID;

if (!ORIGINAL_MEDIA_FOLDER_ID || !COMPRESSED_MEDIA_FOLDER_ID) {
  // runtime check kept in handler as well
}

// Egyszerű in-memory lock, hogy egyszerre csak egy futás menjen egy példányon
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

function mimeFor(format: "webp" | "jpeg" | "png"): string {
  switch (format) {
    case "webp":
      return "image/webp";
    case "jpeg":
      return "image/jpeg";
    default:
      return "image/png";
  }
}

/** Tömörítési rutin: megpróbál WebP -> JPEG -> PNG, csökkentve a quality-t, cél: targetBytes */
async function compressToTargetBytes(
  imgBuffer: Buffer,
  targetBytes = 4 * 1024,
  minQuality = 5,
): Promise<{ buffer: Buffer; mimeType: string; format: string; meta: any }> {
  let bestBuffer: Buffer | null = null;
  let bestFormat: "webp" | "jpeg" | "png" | null = null;
  let bestQuality: number | null = null;
  let bestSize = Number.POSITIVE_INFINITY;

  const tryLoop = async (format: "webp" | "jpeg") => {
    for (let q = 80; q >= minQuality; q -= 5) {
      const buf = await sharp(imgBuffer)
        .toFormat(
          format,
          format === "webp"
            ? { quality: q, effort: 6 }
            : { quality: q, progressive: true },
        )
        .toBuffer();
      if (buf.length < bestSize) {
        bestBuffer = buf;
        bestFormat = format;
        bestQuality = q;
        bestSize = buf.length;
      }
      if (buf.length <= targetBytes) {
        return {
          buffer: buf,
          mimeType: format === "webp" ? "image/webp" : "image/jpeg",
          format,
          meta: { quality: q, size: buf.length, success: true },
        } as const;
      }
    }
    return null;
  };

  // 1) WebP
  try {
    const r = await tryLoop("webp");
    if (r) return r;
  } catch (e) {
    console.warn("WebP conversion not available:", e);
  }

  // 2) JPEG
  try {
    const r = await tryLoop("jpeg");
    if (r) return r;
  } catch (e) {
    console.warn("JPEG conversion failed:", e);
  }

  // 3) PNG best-effort
  try {
    const png = await sharp(imgBuffer)
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toBuffer();
    if (png.length < bestSize) {
      bestBuffer = png;
      bestFormat = "png";
      bestQuality = null;
      bestSize = png.length;
    }
    if (png.length <= targetBytes) {
      return {
        buffer: png,
        mimeType: "image/png",
        format: "png",
        meta: { size: png.length, success: true },
      } as const;
    }
  } catch (e) {
    console.warn("PNG conversion failed:", e);
  }

  if (bestBuffer && bestFormat) {
    return {
      buffer: bestBuffer,
      mimeType: mimeFor(bestFormat),
      format: bestFormat,
      meta: { quality: bestQuality, size: bestSize, success: false },
    };
  }

  const fallback = await sharp(imgBuffer).jpeg({ quality: 50 }).toBuffer();
  return {
    buffer: fallback,
    mimeType: "image/jpeg",
    format: "jpeg",
    meta: { quality: 50, size: fallback.length, success: false },
  };
}

async function processOneImage(
  drive: any,
  f: any,
  idx: number,
  total: number,
  selfUser: any,
) {
  const fileId = f.id as string | undefined;
  const fileName = (f.name as string | undefined) ?? "image";
  const itemStart = Date.now();
  try {
    if (!fileId) {
      const result = {
        original: { id: f.id, name: f.name },
        error: "Missing fileId",
      };
      return { result, success: false };
    }
    console.log(
      `[compressE5Media] (${idx + 1}/${total}) Processing: ${fileName} [${fileId}]`,
    );
    // letöltés (alt='media' -> stream)
    console.log("[compressE5Media]  - Downloading original bytes...");
    const res: any = await drive.files.get(
      { fileId, alt: "media", supportsAllDrives: true } as any,
      { responseType: "stream" } as any,
    );
    const stream = res.data;
    const fileBuffer = await streamToBuffer(stream);
    console.log(`[compressE5Media]    ✓ Downloaded ${fileBuffer.length} bytes`);

    // EXIF orientáció figyelembevétele és arányos kicsinyítés: magasság = 200px (nincs vágás)
    console.log("[compressE5Media]  - Resizing to height=200 (keep aspect)...");
    const resizedBuffer = await sharp(fileBuffer)
      .rotate()
      .resize({ height: 200, withoutEnlargement: true })
      .toBuffer();
    let resizedWidth: number | null = null;
    let resizedHeight: number | null = null;
    try {
      const meta = await sharp(resizedBuffer).metadata();
      console.log(
        `[compressE5Media]    ✓ Resized dimensions: ${meta.width}x${meta.height}`,
      );
      resizedWidth = meta.width ?? null;
      resizedHeight = meta.height ?? null;
    } catch {
      // ignore metadata errors
    }

    // domináns szín (egyszerű 1x1 average)
    console.log("[compressE5Media]  - Computing dominant color...");
    const color = await averageColorHex(resizedBuffer);
    if (color) console.log(`[compressE5Media]    ✓ Dominant color: ${color}`);

    // tömörítés a célméretre (10 KB)
    const targetBytes = 10 * 1024;
    console.log(
      `[compressE5Media]  - Compressing to target ${targetBytes} bytes...`,
    );
    const compressed = await compressToTargetBytes(
      resizedBuffer,
      targetBytes,
      5,
    );
    console.log(
      `[compressE5Media]    ✓ Compressed: format=${compressed.format}, size=${compressed.buffer.length} bytes, meta=${JSON.stringify(
        compressed.meta,
      )}`,
    );

    // feltöltés Drive-ba
    let compressedExt = "png";
    if (compressed.format === "webp") compressedExt = "webp";
    else if (compressed.format === "jpeg") compressedExt = "jpg";
    const compressedName = `${fileName.replace(/\.[^/.]+$/, "")}_compressed.${compressedExt}`;

    const mediaStream = Readable.from(compressed.buffer);
    console.log("[compressE5Media]  - Uploading compressed file to Drive...");
    const uploadRes: any = await drive.files.create(
      {
        requestBody: {
          name: compressedName,
          parents: [COMPRESSED_MEDIA_FOLDER_ID],
          mimeType: compressed.mimeType,
        },
        media: {
          mimeType: compressed.mimeType,
          body: mediaStream,
        },
        supportsAllDrives: true,
      } as any,
      { fields: "id, name" } as any,
    );
    const compressedDriveId = uploadRes.data?.id as string | undefined;
    console.log(
      `[compressE5Media]    ✓ Uploaded: ${compressedName} -> ${compressedDriveId}`,
    );

    // --- DB upsert a külön modulból ---
    console.log("[compressE5Media]  - Upserting DB record...");
    await upsertMediaImage(selfUser, {
      original_drive_id: fileId,
      original_file_name: fileName,
      color,
      compressed_drive_id: compressedDriveId!,
      compressed_file_name: compressedName,
      // Tömörített kép tényleges méretei
      compressed_width: resizedWidth ?? 0,
      compressed_height: resizedHeight ?? 0,
    });
    console.log("[compressE5Media]    ✓ DB upsert done");

    const result = {
      original: { id: fileId, name: fileName },
      compressed: {
        id: compressedDriveId,
        name: compressedName,
        size: compressed.buffer.length,
        mime: compressed.mimeType,
      },
      compressionMeta: compressed.meta,
      color,
    };
    const itemDur = Date.now() - itemStart;
    console.log(
      `[compressE5Media] (${idx + 1}/${total}) DONE: ${fileName} in ${itemDur} ms`,
    );
    return { result, success: true };
  } catch (err: any) {
    const itemDur = Date.now() - itemStart;
    console.error(
      `[compressE5Media] (${idx + 1}/${total}) ERROR processing ${fileName} after ${itemDur} ms:`,
      err,
    );
    const result = {
      original: { id: f.id, name: f.name },
      error: String(err?.message ?? err),
    };
    return { result, success: false };
  }
}

export async function GET(req: Request) {
  if (process.env.LITE_MODE === "true") {
    return NextResponse.json(
      { error: "Not available in LITE_MODE" },
      { status: 403 },
    );
  }
  console.log("[compressE5Media] START: Checking auth and env...");
  const selfUser = await getAuth();
  if (!selfUser)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!gate(selfUser, "e5media", "boolean"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!ORIGINAL_MEDIA_FOLDER_ID || !COMPRESSED_MEDIA_FOLDER_ID) {
    return NextResponse.json(
      { error: "Missing folder ID in env" },
      { status: 400 },
    );
  }

  // optional parallelization via query params
  const url = new URL(req.url);
  const parallelFlag = url.searchParams.get("parallel");
  const concurrencyParam = url.searchParams.get("concurrency");
  const defaultConcurrency = Math.min(Math.max(1, cpus().length || 1), 8);
  const parallel = parallelFlag === "true";
  let concurrency = defaultConcurrency;
  if (concurrencyParam) {
    const n = Number(concurrencyParam);
    if (!Number.isNaN(n) && n > 0) {
      concurrency = Math.min(Math.max(1, Math.floor(n)), 16);
    }
  }
  if (!parallel) concurrency = 1;

  // Concurrency guard
  if (isProcessing) {
    console.warn(
      "[compressE5Media] BLOCKED: A previous run is still in progress. Skipping.",
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
    // 1) lépés: korábbi ID-k lekérése (a te implementációd)
    console.log("[compressE5Media] Fetching existing original IDs from DB...");
    const oldOriginalImageIDs = await getOriginalImagesFileID();
    console.log(
      `[compressE5Media] Known original IDs: ${oldOriginalImageIDs.length}`,
    );

    let drive;
    try {
      console.log("[compressE5Media] Initializing Google Drive client...");
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

    // Ellenőrizzük, hogy a mappa elérhető-e a service account számára
    let folderDriveId: string | undefined;
    try {
      const folderMeta = await drive.files.get({
        fileId: ORIGINAL_MEDIA_FOLDER_ID,
        fields: "id,name,driveId,ownedByMe,permissions",
        supportsAllDrives: true,
      });
      folderDriveId = (folderMeta.data as any)?.driveId as string | undefined;
      console.log("Original folder:", folderMeta.data);
    } catch (e) {
      console.warn("Original folder not accessible for service account:", e);
    }

    // listázás: ha Shared Drive, kérdezzünk azon belül
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
    console.log("[compressE5Media] Listing files in original folder...");
    const filesList = await drive.files.list(listParams);

    console.log(
      "[compressE5Media] Total items in folder:",
      filesList.data.files?.length,
    );

    const newOriginalImages =
      filesList.data.files?.filter((f: any) =>
        f.mimeType?.startsWith("image/"),
      ) || [];
    const missingOriginalImages = newOriginalImages.filter(
      (f: any) => !oldOriginalImageIDs.includes(f.id ?? ""),
    );

    console.log(
      `[compressE5Media] Images found: ${newOriginalImages.length}, new to process: ${missingOriginalImages.length}`,
    );

    if (missingOriginalImages.length === 0) {
      const durationMs = Date.now() - startedAt;
      console.log(
        `[compressE5Media] DONE: No new images. Duration: ${durationMs} ms`,
      );
      return NextResponse.json({
        message: "No new images to process",
        checked: newOriginalImages.length,
        durationMs,
      });
    }

    const results: any[] = [];
    let successCount = 0;
    let errorCount = 0;

    if (parallel && concurrency > 1) {
      console.log(
        `[compressE5Media] Parallel processing enabled; concurrency=${concurrency}`,
      );
      const total = missingOriginalImages.length;
      const out: Array<{ result: any; success: boolean } | undefined> =
        new Array(total);
      let cursor = 0;

      const worker = async () => {
        while (true) {
          const idx = cursor++;
          if (idx >= total) break;
          const r = await processOneImage(
            drive,
            missingOriginalImages[idx],
            idx,
            total,
            selfUser,
          );
          out[idx] = r;
        }
      };

      const workers = Array(Math.min(concurrency, missingOriginalImages.length))
        .fill(0)
        .map(() => worker());
      await Promise.all(workers);

      for (const r of out) {
        if (!r) continue;
        results.push(r.result);
        if (r.success) successCount++;
        else errorCount++;
      }
    } else {
      for (let idx = 0; idx < missingOriginalImages.length; idx++) {
        const r = await processOneImage(
          drive,
          missingOriginalImages[idx],
          idx,
          missingOriginalImages.length,
          selfUser,
        );
        results.push(r.result);
        if (r.success) successCount++;
        else errorCount++;
      }
    }

    const durationMs = Date.now() - startedAt;
    console.log(
      `[compressE5Media] DONE: processed=${results.length}, success=${successCount}, errors=${errorCount}, duration=${durationMs} ms`,
    );

    return NextResponse.json(
      {
        processed: results.length,
        success: successCount,
        errors: errorCount,
        durationMs,
        details: results,
      },
      { status: 200 },
    );
  } finally {
    isProcessing = false;
    lastRunStartTs = null;
    console.log("[compressE5Media] RELEASED lock");
  }
}

export async function POST(req: Request) {
  // Read options from JSON body and delegate to GET by appending query params
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // ignore if no body
  }
  const url = new URL(req.url);
  const parallel = Boolean(
    body?.parallel ?? body?.useMultipleProcessors ?? false,
  );
  const concurrency = body?.concurrency;
  if (parallel) url.searchParams.set("parallel", "true");
  if (concurrency != null) {
    url.searchParams.set("concurrency", String(concurrency));
  }
  return GET(new Request(url.toString()));
}
