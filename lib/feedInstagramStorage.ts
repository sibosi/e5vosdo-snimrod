import { Readable } from "stream";
import { getDriveClient } from "@/db/autobackup";

export function isFeedMediaDriveEnabled() {
  return process.env.IS_FEED_IMAGE_DRIVE_STORAGE_ENABLED == "true";
}

export function shouldStoreFeedVideos() {
  return process.env.IS_FEED_VIDEO_DRIVE_STORAGE_ENABLED == "true";
}

export function getFeedMediaFolderId() {
  const folderId = (process.env.FEED_IG_MEDIA_FOLDER_ID ?? "").trim();
  if (!folderId) throw new Error("FEED_IG_MEDIA_FOLDER_ID is not configured");
  return folderId;
}

function mimeTypeToExtension(mimeType?: string | null) {
  if (!mimeType) return "";
  if (mimeType.includes("jpeg")) return "jpg";
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("webp")) return "webp";
  if (mimeType.includes("gif")) return "gif";
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("quicktime")) return "mov";
  return "";
}

export async function uploadFeedMediaToDrive(options: {
  mediaUrl: string;
  fileNameBase: string;
  mimeTypeHint?: string | null;
}) {
  const response = await fetch(options.mediaUrl);
  if (!response.ok) {
    throw new Error(`Failed to download media: ${response.status}`);
  }

  const mimeType = response.headers.get("content-type") ?? options.mimeTypeHint;
  const buffer = Buffer.from(await response.arrayBuffer());
  const extension = mimeTypeToExtension(mimeType);
  const fileName = extension
    ? `${options.fileNameBase}.${extension}`
    : options.fileNameBase;

  const drive = getDriveClient();
  const folderId = getFeedMediaFolderId();

  const uploadResponse = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType: mimeType ?? "application/octet-stream",
      body: Readable.from(buffer),
    },
    fields: "id,mimeType,md5Checksum",
    supportsAllDrives: true,
  });

  return {
    driveFileId: uploadResponse.data.id ?? "",
    driveMimeType: uploadResponse.data.mimeType ?? mimeType ?? "",
    driveMd5: uploadResponse.data.md5Checksum ?? null,
  };
}
