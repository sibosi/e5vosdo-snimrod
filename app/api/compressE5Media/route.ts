// app/api/drive-sync/route.ts
import { NextResponse } from "next/server";
import { getDriveClient } from "@/db/autobackup";
import { getOriginalImagesFileID, upsertMediaImage } from "@/db/mediaimages";
import sharp from "sharp";
import { Readable } from "stream";

const ORIGINAL_MEDIA_FOLDER_ID =
  process.env.NEXT_PUBLIC_ORIGINAL_MEDIA_FOLDER_ID;
const COMPRESSED_MEDIA_FOLDER_ID = process.env.NEXT_PUBLIC_MEDIA_FOLDER_ID;

if (!ORIGINAL_MEDIA_FOLDER_ID || !COMPRESSED_MEDIA_FOLDER_ID) {
  // runtime check kept in handler as well
}

/** Segéd: stream -> Buffer */
async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (c) => chunks.push(Buffer.from(c)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (err) => reject(err));
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
  targetBytes = 2 * 1024,
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

export async function GET() {
  if (!ORIGINAL_MEDIA_FOLDER_ID || !COMPRESSED_MEDIA_FOLDER_ID) {
    return NextResponse.json(
      { error: "Missing folder ID in env" },
      { status: 400 },
    );
  }

  // 1) lépés: korábbi ID-k lekérése (a te implementációd)
  const oldOriginalImageIDs = await getOriginalImagesFileID();

  let drive;
  try {
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
  const filesList = await drive.files.list(listParams);

  console.log("Length of new original images:", filesList.data.files?.length);

  const newOriginalImages =
    filesList.data.files?.filter((f: any) =>
      f.mimeType?.startsWith("image/"),
    ) || [];
  const missingOriginalImages = newOriginalImages.filter(
    (f: any) => !oldOriginalImageIDs.includes(f.id ?? ""),
  );

  if (missingOriginalImages.length === 0) {
    return NextResponse.json({
      message: "No new images to process",
      checked: newOriginalImages.length,
    });
  }

  const results: any[] = [];

  for (const f of missingOriginalImages) {
    const fileId = f.id as string | undefined;
    const fileName = (f.name as string | undefined) ?? "image";
    try {
      if (!fileId) {
        results.push({
          original: { id: f.id, name: f.name },
          error: "Missing fileId",
        });
        continue;
      }
      // letöltés (alt='media' -> stream)
      const res: any = await (drive.files.get(
        { fileId, alt: "media", supportsAllDrives: true } as any,
        { responseType: "stream" } as any,
      ) as any);
      const stream = res.data;
      const fileBuffer = await streamToBuffer(stream);

      // EXIF orientáció figyelembevétele és középre vágás 100x100
      const squaredBuffer = await sharp(fileBuffer)
        .rotate()
        .resize({ width: 100, height: 100, fit: "cover", position: "centre" })
        .toBuffer();

      // domináns szín (egyszerű 1x1 average)
      const color = await averageColorHex(squaredBuffer);

      // tömörítés a célméretre (2 KB)
      const targetBytes = 2 * 1024;
      const compressed = await compressToTargetBytes(
        squaredBuffer,
        targetBytes,
        5,
      );

      // feltöltés Drive-ba
      let compressedExt = "png";
      if (compressed.format === "webp") compressedExt = "webp";
      else if (compressed.format === "jpeg") compressedExt = "jpg";
      const compressedName = `${fileName.replace(/\.[^/.]+$/, "")}_compressed.${compressedExt}`;

      const mediaStream = Readable.from(compressed.buffer);

      const uploadRes: any = await (drive.files.create(
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
      ) as any);
      const compressedDriveId = uploadRes.data?.id as string | undefined;

      // --- DB upsert a külön modulból ---
      await upsertMediaImage({
        original_drive_id: fileId,
        original_file_name: fileName,
        color,
        compressed_drive_id: compressedDriveId!,
        compressed_file_name: compressedName,
        compressed_square_size: 100,
      });

      results.push({
        original: { id: fileId, name: fileName },
        compressed: {
          id: compressedDriveId,
          name: compressedName,
          size: compressed.buffer.length,
          mime: compressed.mimeType,
        },
        compressionMeta: compressed.meta,
        color,
      });
    } catch (err: any) {
      results.push({
        original: { id: f.id, name: f.name },
        error: String(err?.message ?? err),
      });
    }
  }

  return NextResponse.json(
    { processed: results.length, details: results },
    { status: 200 },
  );
}
