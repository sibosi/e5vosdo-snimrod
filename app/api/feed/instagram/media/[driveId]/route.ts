export const runtime = "nodejs";

import fs from "fs";
import { NextResponse } from "next/server";
import { getDriveClient } from "@/db/autobackup";
import { getFeedMediaByDriveId } from "@/db/feedInstagram";
import {
  getCachedFeedMediaPath,
  getFeedCachePath,
  writeFeedCacheFile,
} from "@/lib/feedMediaCache";

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (error) => reject(error));
  });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ driveId: string }> },
) {
  const { driveId } = await context.params;
  if (!driveId) {
    return NextResponse.json({ error: "Missing driveId" }, { status: 400 });
  }

  const media = await getFeedMediaByDriveId(driveId);
  if (!media) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }

  const cachedPath = getCachedFeedMediaPath(driveId, media.drive_md5);
  if (cachedPath) {
    const stream = fs.createReadStream(cachedPath);
    // @ts-expect-error - Node stream is compatible with Response.
    return new Response(stream, {
      headers: {
        "Content-Type": media.drive_mime_type || "application/octet-stream",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  }

  try {
    const drive = getDriveClient();
    const driveRes = await drive.files.get(
      {
        fileId: driveId,
        alt: "media",
        supportsAllDrives: true,
      },
      { responseType: "stream" },
    );

    const buffer = await streamToBuffer(driveRes.data as NodeJS.ReadableStream);
    const cachePath = getFeedCachePath(driveId, media.drive_md5);
    writeFeedCacheFile(cachePath, buffer);

    const body = new Uint8Array(buffer);

    return new Response(body, {
      headers: {
        "Content-Type":
          media.drive_mime_type ||
          driveRes.headers["content-type"] ||
          "application/octet-stream",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (error: any) {
    console.error("Failed to load feed media from Drive", error);
    return NextResponse.json(
      { error: error?.message ?? "Failed to load media" },
      { status: error?.code || 502 },
    );
  }
}
