// pages/api/process-drive.ts
import { google } from "googleapis";
import sharp from "sharp";
import path from "path";
import stream from "stream";
import util from "util";
import fs from "fs";
import { NextResponse } from "next/server";

const pipeline = util.promisify(stream.pipeline);

const {
  SERVICE_ACCOUNT_KEY,
  NEXT_PUBLIC_SRC_MEDIA_FOLDER_ID,
  NEXT_PUBLIC_MEDIA_FOLDER_ID,
  TARGET_KB = "2",
  // Optional: If folders are in a specific Shared Drive, set its ID to scope queries.
  GDRIVE_DRIVE_ID,
} = process.env;

if (
  !SERVICE_ACCOUNT_KEY ||
  !NEXT_PUBLIC_SRC_MEDIA_FOLDER_ID ||
  !NEXT_PUBLIC_MEDIA_FOLDER_ID
) {
  console.warn(
    "Missing some env vars for Google Drive. Set SERVICE_ACCOUNT_KEY, NEXT_PUBLIC_SRC_MEDIA_FOLDER_ID, NEXT_PUBLIC_MEDIA_FOLDER_ID",
  );
}

type ResultEntry = {
  originalName: string;
  fileId: string;
  status: "skipped" | "processed" | "failed" | "uploaded_best_effort";
  note?: string;
  sizeBytes?: number;
  outFileId?: string;
};

async function getDriveClient() {
  // SERVICE ACCOUNT JSON lehet közvetlen JSON string az env-ben vagy fájlútvonal
  let keyObj: any;
  try {
    keyObj = JSON.parse(SERVICE_ACCOUNT_KEY as string);
  } catch (e) {
    // ha nem JSON, akkor olvassuk be fájlként (dinamikus require helyett fs, hogy elkerüljük a webpack figyelmeztetést)
    const jsonStr = fs.readFileSync(SERVICE_ACCOUNT_KEY as string, "utf8");
    keyObj = JSON.parse(jsonStr);
  }

  // Biztosítsuk a privát kulcs formázását (néha \n-ként érkezik)
  const privateKey: string = (keyObj.private_key || "").replace(/\\n/g, "\n");

  const jwt = new google.auth.JWT({
    email: keyObj.client_email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  await jwt.authorize();
  return google.drive({ version: "v3", auth: jwt });
}

async function listImagesInFolder(
  drive: any,
  folderId: string,
  extraFields = "id, name, mimeType, size, appProperties",
) {
  const q = `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`;
  const common: Record<string, any> = {
    q,
    fields: `nextPageToken, files(${extraFields})`,
    pageSize: 1000,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  };
  if (GDRIVE_DRIVE_ID) {
    common.driveId = GDRIVE_DRIVE_ID;
    common.corpora = "drive";
  }
  const res = await drive.files.list(common);
  return res.data.files || [];
}

async function listDestFilesWithAppProperties(drive: any, folderId: string) {
  // Kellenek az appProperties mezők is, plusz név és id
  const files = await listImagesInFolder(
    drive,
    folderId,
    "id, name, mimeType, size, appProperties",
  );
  return files;
}

async function downloadFileToBuffer(drive: any, fileId: string) {
  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "stream" },
  );
  const chunks: Buffer[] = [];
  return new Promise<Buffer>((resolve, reject) => {
    const rs = res.data as stream.Readable;
    rs.on("data", (c: Buffer) => chunks.push(c));
    rs.on("end", () => resolve(Buffer.concat(chunks)));
    rs.on("error", reject);
  });
}

async function uploadBufferAsFile(
  drive: any,
  buffer: Buffer,
  name: string,
  mimeType: string,
  parents: string[],
  originalId: string,
) {
  // Az appProperties mezőben eltároljuk az eredeti fileId-t
  const res = await drive.files.create({
    requestBody: {
      name,
      parents,
      mimeType,
      appProperties: {
        originalId,
      },
    },
    media: {
      mimeType,
      body: stream.Readable.from(buffer),
    },
    fields: "id, name, appProperties",
    supportsAllDrives: true,
  });
  return res.data;
}

// center crop to square then resize to 100x100
async function cropAndResize100(buffer: Buffer) {
  const img = sharp(buffer, { failOnError: false }).rotate(); // exif rotation
  const metadata = await img.metadata();
  const width = metadata.width || 100;
  const height = metadata.height || 100;
  const side = Math.min(width, height);
  const left = Math.max(0, Math.floor((width - side) / 2));
  const top = Math.max(0, Math.floor((height - side) / 2));
  const cropped = img
    .extract({ left, top, width: side, height: side })
    .resize(100, 100, { fit: "fill" });
  return cropped;
}

// próbál WebP->JPEG minőség-csökkentést. Ha nem sikerül a target alatt, visszaadja a legjobb próbálkozást.
async function compressToTarget(
  imgSharp: sharp.Sharp,
  targetBytes: number,
  minQuality = 5,
) {
  let best: {
    buffer: Buffer;
    mime: string;
    size: number;
    quality?: number;
  } | null = null;

  // WebP próbálkozás (jobb kompresszió általában)
  for (let q = 80; q >= minQuality; q -= 5) {
    try {
      const buf = await imgSharp.webp({ quality: q, effort: 6 }).toBuffer();
      const sz = buf.byteLength;
      if (!best || sz < best.size)
        best = { buffer: buf, mime: "image/webp", size: sz, quality: q };
      if (sz <= targetBytes)
        return {
          buffer: buf,
          mime: "image/webp",
          size: sz,
          quality: q,
          success: true,
        };
    } catch (e) {
      // ha webp nem támogatott a környezetben, folytatjuk jpeg-tel
      break;
    }
  }

  // JPEG próbálkozás
  for (let q = 80; q >= minQuality; q -= 5) {
    try {
      const buf = await imgSharp
        .jpeg({ quality: q, progressive: true })
        .toBuffer();
      const sz = buf.byteLength;
      if (!best || sz < best.size)
        best = { buffer: buf, mime: "image/jpeg", size: sz, quality: q };
      if (sz <= targetBytes)
        return {
          buffer: buf,
          mime: "image/jpeg",
          size: sz,
          quality: q,
          success: true,
        };
    } catch (e) {
      // ignore
    }
  }

  // PNG kvantálás próbálkozás (gyakran nagy)
  try {
    const buf = await imgSharp.png({ palette: true }).toBuffer();
    const sz = buf.byteLength;
    if (!best || sz < best.size)
      best = { buffer: buf, mime: "image/png", size: sz };
    if (sz <= targetBytes)
      return { buffer: buf, mime: "image/png", size: sz, success: true };
  } catch (e) {
    // ignore
  }

  // ha nem értük el a targetet, visszaadjuk a legjobb próbálkozást (best-effort)
  return {
    buffer: best!.buffer,
    mime: best!.mime,
    size: best!.size,
    quality: best!.quality,
    success: false,
  };
}

// segédfüggvény: fájlnév expected output névhez
function expectedOutName(originalName: string, outExt: string) {
  const base = path.parse(originalName).name;
  return `${base}_100x100${outExt}`;
}

function extFromMime(mime: string) {
  if (!mime) return ".bin";
  if (mime.includes("jpeg") || mime.includes("jpg")) return ".jpg";
  if (mime.includes("webp")) return ".webp";
  if (mime.includes("png")) return ".png";
  return ".img";
}

export async function GET() {
  try {
    // Gyors diagnosztika
    if (
      !SERVICE_ACCOUNT_KEY ||
      !NEXT_PUBLIC_SRC_MEDIA_FOLDER_ID ||
      !NEXT_PUBLIC_MEDIA_FOLDER_ID
    ) {
      return NextResponse.json(
        {
          error:
            "Missing env vars. Required: SERVICE_ACCOUNT_KEY, NEXT_PUBLIC_SRC_MEDIA_FOLDER_ID, NEXT_PUBLIC_MEDIA_FOLDER_ID",
        },
        { status: 400 },
      );
    }

    const drive = await getDriveClient();

    // 1) lekérjük forrás fájlokat
    const sourceFiles = await listImagesInFolder(
      drive,
      NEXT_PUBLIC_SRC_MEDIA_FOLDER_ID as string,
      "id, name, mimeType, size",
    );

    // 2) lekérjük a dest fájlokat appProperties-szal (ha vannak)
    const destFiles = await listDestFilesWithAppProperties(
      drive,
      NEXT_PUBLIC_MEDIA_FOLDER_ID as string,
    );

    // Diagnosztika: hány fájl
    console.log(
      `refreshImages: source count=${sourceFiles.length}, dest count=${destFiles.length}, driveId=${GDRIVE_DRIVE_ID ? "set" : "unset"}`,
    );

    // 3) készítünk egy set-et az already processed source-id-kből (appProperties alapján)
    const processedOriginalIds = new Set<string>();
    const destNamesSet = new Set<string>();
    for (const df of destFiles) {
      if (df.appProperties && df.appProperties.originalId) {
        processedOriginalIds.add(df.appProperties.originalId as string);
      }
      if (df.name) destNamesSet.add(df.name as string);
    }

    const results: ResultEntry[] = [];
    const targetBytes = Number(TARGET_KB) * 1024;

    for (const f of sourceFiles) {
      const id = f.id as string;
      const name = f.name as string;

      // Ha az appProperties alapján már feldolgoztuk
      if (processedOriginalIds.has(id)) {
        results.push({
          originalName: name,
          fileId: id,
          status: "skipped",
          note: "already processed (appProperties)",
        });
        continue;
      }

      // Fallback: ellenőrizzük, hogy van-e dest fájl név alapján (basename_100x100.*)
      // Ha találunk bármilyen kiterjesztésű egyezést, feltételezzük, hogy feldolgozva volt
      const expectedAny = `${path.parse(name).name}_100x100`;
      let nameMatched = false;
      for (const dn of Array.from(destNamesSet)) {
        if (dn.startsWith(expectedAny)) {
          nameMatched = true;
          break;
        }
      }
      if (nameMatched) {
        results.push({
          originalName: name,
          fileId: id,
          status: "skipped",
          note: "already processed (filename match)",
        });
        continue;
      }

      // --- Nincs feldolgozva, tehát letöltjük és feldolgozzuk ---
      try {
        const buf = await downloadFileToBuffer(drive, id);
        const sharpImg = await cropAndResize100(buf);
        const comp = await compressToTarget(sharpImg, targetBytes, 5);

        const outExt = extFromMime(comp.mime);
        const outName = expectedOutName(name, outExt);

        const uploaded = await uploadBufferAsFile(
          drive,
          comp.buffer,
          outName,
          comp.mime,
          [NEXT_PUBLIC_MEDIA_FOLDER_ID as string],
          id,
        );

        const status: ResultEntry = {
          originalName: name,
          fileId: id,
          status: comp.success ? "processed" : "uploaded_best_effort",
          note: comp.success
            ? "target reached"
            : "could not reach target; best-effort uploaded",
          sizeBytes: comp.size,
          outFileId: uploaded.id,
        };
        results.push(status);

        // rögtön frissítjük a processed set-et, hogy a következő iterációk is lássák
        processedOriginalIds.add(id);
        destNamesSet.add(uploaded.name as string);
      } catch (err: any) {
        results.push({
          originalName: name,
          fileId: id,
          status: "failed",
          note: String(err.message || err),
        });
      }
    }

    return NextResponse.json({
      results,
      timestamp: new Date().toISOString(),
      counts: { source: sourceFiles.length, dest: destFiles.length },
    });
  } catch (err: any) {
    return NextResponse.json({ error: String(err.message || err) });
  }
}
