import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { Readable } from "stream";
import sharp from "sharp";
import { getAuth } from "@/db/dbreq";
import {
  attachExpoTag,
  getExpoImages,
  getImageById,
  upsertMediaImage,
} from "@/db/mediaPhotos";
import { getDriveClient } from "@/db/autobackup";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ORIGINAL_MEDIA_FOLDER_ID =
  process.env.NEXT_PUBLIC_ORIGINAL_MEDIA_FOLDER_ID;

function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 100);
}

export async function GET() {
  const selfUser = await getAuth();
  if (!selfUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json({ images: await getExpoImages(selfUser) });
  } catch (error) {
    console.error("[event/expo-photo] Failed to load images:", error);
    return NextResponse.json(
      { error: "Could not load expo photos" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const selfUser = await getAuth();
  return NextResponse.json({ error: "Disabled API" }, { status: 403 });
  if (!selfUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!ORIGINAL_MEDIA_FOLDER_ID) {
    return NextResponse.json(
      { error: "Original media folder is not configured" },
      { status: 500 },
    );
  }

  let driveFileId: string | undefined;
  try {
    const formData = await request.formData();
    const confirmed = formData.get("confirmed");
    const file = formData.get("file");

    if (confirmed !== "true") {
      return NextResponse.json(
        {
          error:
            "You must confirm that the photo was taken at the expo in school",
        },
        { status: 400 },
      );
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No photo uploaded" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 415 },
      );
    }
    if (file.size <= 0 || file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        {
          error: `The photo must be smaller than ${MAX_FILE_BYTES / (1024 * 1024)} MB`,
        },
        { status: 413 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(buffer).metadata();
    if (!metadata.format || !metadata.width || !metadata.height) {
      return NextResponse.json(
        { error: "The uploaded file is not a valid image" },
        { status: 400 },
      );
    }

    const originalFileName = `${Date.now()}-${randomUUID()}-${sanitizeFileName(file.name || "expo-photo.jpg")}`;
    const drive = getDriveClient();
    const uploadResponse: any = await drive.files.create(
      {
        requestBody: {
          name: originalFileName,
          parents: [ORIGINAL_MEDIA_FOLDER_ID],
          mimeType: file.type,
        },
        media: {
          mimeType: file.type,
          body: Readable.from(buffer),
        },
        supportsAllDrives: true,
        fields: "id",
      } as any,
      {} as any,
    );
    driveFileId = uploadResponse.data?.id;
    if (!driveFileId) throw new Error("Drive upload did not return a file ID");

    const insertResult: any = await upsertMediaImage(selfUser, {
      original_drive_id: driveFileId,
      original_file_name: originalFileName,
      upload_datetime: new Date().toISOString(),
    });
    const imageId = Number(insertResult.insertId);
    if (!imageId) throw new Error("Media image was not created");

    await attachExpoTag(selfUser, imageId);
    const image = await getImageById(imageId);
    return NextResponse.json({ image }, { status: 201 });
  } catch (error) {
    if (driveFileId) {
      try {
        await getDriveClient().files.delete({
          fileId: driveFileId,
          supportsAllDrives: true,
        });
      } catch (cleanupError) {
        console.error(
          "[event/expo-photo] Failed to clean up Drive upload:",
          cleanupError,
        );
      }
    }
    console.error("[event/expo-photo] Upload failed:", error);
    return NextResponse.json(
      { error: "Could not upload the photo" },
      { status: 500 },
    );
  }
}
