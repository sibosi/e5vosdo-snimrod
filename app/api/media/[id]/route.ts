import { NextResponse } from "next/server";
import { getAuth } from "@/db/dbreq";
import {
  getImageById,
  updateImagePreview,
  MediaImageType,
} from "@/db/mediaPhotos";
import { getDriveClient } from "@/db/autobackup";
import {
  isCached,
  readCachedFile,
  writeCacheFile,
  type PreviewSize,
} from "@/lib/mediaCache";
import sharp from "sharp";
import { Readable } from "stream";

// Preview mappa ID-k (a tömörített képek ide kerülnek)
const PREVIEW_FOLDER_ID = process.env.NEXT_PUBLIC_MEDIA_FOLDER_ID;

// Preview méretek konfigurációja
const PREVIEW_CONFIG = {
  small: {
    width: undefined,
    height: 200,
    quality: 75,
    targetBytes: 15 * 1024, // 15KB max
  },
  large: {
    width: 1200,
    height: undefined,
    quality: 85,
    targetBytes: 200 * 1024, // 200KB max
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

/**
 * Letölti a már meglévő preview-t a Drive-ról (ha van).
 */
async function fetchPreviewFromDrive(
  previewDriveId: string,
): Promise<Buffer | null> {
  try {
    const drive = getDriveClient();
    const res: any = await drive.files.get(
      { fileId: previewDriveId, alt: "media", supportsAllDrives: true } as any,
      { responseType: "stream" } as any,
    );
    return await streamToBuffer(res.data);
  } catch (error) {
    console.error("[media-proxy] Error fetching preview from Drive:", error);
    return null;
  }
}

/**
 * Feltölti a preview-t a Drive-ra és visszaadja az új file ID-t.
 */
async function uploadPreviewToDrive(
  buffer: Buffer,
  originalFileName: string,
  size: PreviewSize,
): Promise<string | null> {
  if (!PREVIEW_FOLDER_ID) {
    console.error("[media-proxy] PREVIEW_FOLDER_ID not set");
    return null;
  }

  try {
    const drive = getDriveClient();
    const previewName = `${originalFileName.replace(/\.[^/.]+$/, "")}_${size}.webp`;

    const mediaStream = Readable.from(buffer);
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
    console.log(
      `[media-proxy] Uploaded preview to Drive: ${previewName} -> ${driveId}`,
    );
    return driveId ?? null;
  } catch (error) {
    console.error("[media-proxy] Error uploading preview to Drive:", error);
    return null;
  }
}

/**
 * Letölti az eredeti képet és tömöríti preview-vá.
 */
async function compressOriginalToPreview(
  originalDriveId: string,
  size: PreviewSize,
): Promise<{ buffer: Buffer; width: number; height: number } | null> {
  try {
    const drive = getDriveClient();

    // Eredeti kép letöltése
    const res: any = await drive.files.get(
      { fileId: originalDriveId, alt: "media", supportsAllDrives: true } as any,
      { responseType: "stream" } as any,
    );

    const fileBuffer = await streamToBuffer(res.data);
    const config = PREVIEW_CONFIG[size];

    // Resize és tömörítés
    let sharpInstance = sharp(fileBuffer).rotate(); // EXIF orientáció

    if (size === "small") {
      sharpInstance = sharpInstance.resize({
        height: config.height,
        withoutEnlargement: true,
      });
    } else {
      sharpInstance = sharpInstance.resize({
        width: config.width,
        withoutEnlargement: true,
      });
    }

    // WebP tömörítés célméretre
    let quality = config.quality;
    let buffer: Buffer;
    let attempts = 0;

    do {
      buffer = await sharpInstance.clone().webp({ quality }).toBuffer();
      if (buffer.length <= config.targetBytes || quality <= 30) break;
      quality -= 10;
      attempts++;
    } while (attempts < 6);

    // Méretek lekérése
    const metadata = await sharp(buffer).metadata();

    return {
      buffer,
      width: metadata.width ?? 0,
      height: metadata.height ?? 0,
    };
  } catch (error) {
    console.error("[media-proxy] Error compressing original:", error);
    return null;
  }
}

/**
 * Visszaadja a megfelelő preview Drive ID-t a képből.
 */
function getPreviewDriveId(
  image: MediaImageType,
  size: PreviewSize,
): string | undefined {
  return size === "small"
    ? image.small_preview_drive_id
    : image.large_preview_drive_id;
}

/**
 * GET /api/media/[id]?size=small|large|full
 *
 * Prioritás:
 * 1. Helyi cache (leggyorsabb)
 * 2. Drive-on tárolt preview (szerver újraindítás után)
 * 3. Eredeti képből generálás + feltöltés Drive-ra + helyi cache
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Auth ellenőrzés
  const selfUser = await getAuth();
  if (!selfUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const imageId = Number.parseInt(id, 10);

  if (Number.isNaN(imageId)) {
    return NextResponse.json({ error: "Invalid image ID" }, { status: 400 });
  }

  const url = new URL(request.url);
  const size: PreviewSize | "full" =
    (url.searchParams.get("size") as any) || "small";

  if (size === "full") {
    const originalImage = await getImageById(imageId);
    if (!originalImage) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    try {
      const drive = getDriveClient();

      const res: any = await drive.files.get(
        {
          fileId: originalImage.original_drive_id,
          alt: "media",
          supportsAllDrives: true,
        } as any,
        { responseType: "stream" } as any,
      );

      const webStream = new ReadableStream({
        start(controller) {
          res.data.on("data", (chunk: Buffer) => {
            controller.enqueue(new Uint8Array(chunk));
          });
          res.data.on("end", () => {
            controller.close();
          });
          res.data.on("error", (err: Error) => {
            console.error("[media-proxy] Stream error:", err);
            controller.error(err);
          });
        },
      });

      return new NextResponse(webStream, {
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "public, max-age=31536000, immutable",
          "Content-Disposition": `attachment; filename="${originalImage.original_file_name || "image.jpg"}"`,
          "X-Cache": "FULL-DRIVE-STREAM",
        },
      });
    } catch (error) {
      console.error("[media-proxy] Error streaming full image:", error);
      return NextResponse.json(
        { error: "Failed to fetch original image from Drive" },
        { status: 500 },
      );
    }
  }

  if (size !== "small" && size !== "large") {
    return NextResponse.json(
      { error: "Invalid size, use 'small' or 'large'" },
      { status: 400 },
    );
  }

  // Kép adatok lekérése DB-ből
  const image = await getImageById(imageId);
  if (!image) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  // === 1. HELYI CACHE ELLENŐRZÉS ===
  if (isCached(imageId, size)) {
    const cachedBuffer = readCachedFile(imageId, size);
    if (cachedBuffer) {
      return new NextResponse(new Uint8Array(cachedBuffer), {
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-Cache": "HIT-LOCAL",
        },
      });
    }
  }

  // === 2. DRIVE-ON TÁROLT PREVIEW ELLENŐRZÉS ===
  const previewDriveId = getPreviewDriveId(image, size);
  if (previewDriveId) {
    console.log(
      `[media-proxy] Local cache MISS, fetching preview from Drive: ${previewDriveId}`,
    );

    const driveBuffer = await fetchPreviewFromDrive(previewDriveId);
    if (driveBuffer) {
      // Helyi cache-be mentés a következő kéréshez
      writeCacheFile(imageId, size, driveBuffer);

      return new NextResponse(new Uint8Array(driveBuffer), {
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-Cache": "HIT-DRIVE",
        },
      });
    }
    // Ha a Drive-ról nem sikerült letölteni, folytatjuk az eredeti generálással
    console.warn(`[media-proxy] Failed to fetch from Drive, regenerating...`);
  }

  // === 3. EREDETI KÉPBŐL GENERÁLÁS ===
  console.log(
    `[media-proxy] No preview exists for image ${imageId} (${size}), generating from original...`,
  );

  const result = await compressOriginalToPreview(image.original_drive_id, size);
  if (!result) {
    return NextResponse.json(
      { error: "Failed to generate preview from original" },
      { status: 500 },
    );
  }

  // Helyi cache-be mentés
  writeCacheFile(imageId, size, result.buffer);

  // Drive-ra feltöltés (backup)
  const uploadedDriveId = await uploadPreviewToDrive(
    result.buffer,
    image.original_file_name ?? `image_${imageId}`,
    size,
  );

  // DB frissítése (ha sikerült a feltöltés)
  if (uploadedDriveId) {
    await updateImagePreview(
      imageId,
      size,
      uploadedDriveId,
      result.width,
      result.height,
    );
  }

  console.log(
    `[media-proxy] Generated preview for image ${imageId} (${size}): ${result.width}x${result.height}, ${result.buffer.length} bytes`,
  );

  return new NextResponse(new Uint8Array(result.buffer), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Cache": "MISS",
    },
  });
}
