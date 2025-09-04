import { getDriveClient } from "./autobackup";
import { NextResponse } from "next/server";
import { Readable } from "stream";

export interface ImageData {
  name: string;
  url: string;
  created_at?: string;
  id: string;
}

/**
 * Upload image to Google Drive
 * @param file - The file to upload
 * @param folderId - The Google Drive folder ID where to store the file
 */
export async function uploadImageToDrive(file: File, folderId: string) {
  try {
    const drive = getDriveClient();

    // Generate timestamp-based filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `camera-photo-${timestamp}.jpg`;

    // Convert File to Buffer and then to stream
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = Readable.from(buffer);

    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    const media = {
      mimeType: file.type || "image/jpeg",
      body: stream,
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, name, createdTime, webViewLink",
      supportsAllDrives: true,
    });

    const fileId = response.data.id;
    if (!fileId) {
      throw new Error("Failed to get file ID from Drive response");
    }

    // Make the file publicly accessible
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
      supportsAllDrives: true,
    });

    // Get the proxy URL that will serve the image through our API
    const publicUrl = `/api/camera-photos/image/${fileId}`;

    console.log("File uploaded to Drive:", response.data);

    return NextResponse.json(
      {
        id: fileId,
        name: fileName,
        url: publicUrl,
        created_at: response.data.createdTime,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error uploading to Google Drive:", error);
    return NextResponse.json(
      { error: "Failed to upload image to Drive: " + error.message },
      { status: 500 },
    );
  }
}

/**
 * Get images from Google Drive folder
 * @param folderId - The Google Drive folder ID to list files from
 */
export async function getImagesFromDrive(folderId: string) {
  try {
    const drive = getDriveClient();

    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`,
      orderBy: "createdTime desc",
      fields: "files(id, name, createdTime, mimeType)",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const files = response.data.files || [];

    const images: ImageData[] = files.map((file) => ({
      id: file.id!,
      name: file.name!,
      url: `/api/camera-photos/image/${file.id}`,
      created_at: file.createdTime!,
    }));

    return images;
  } catch (error: any) {
    console.error("Error fetching images from Google Drive:", error);
    throw new Error("Failed to fetch images from Drive: " + error.message);
  }
}

/**
 * Delete image from Google Drive
 * @param fileId - The Google Drive file ID to delete
 */
export async function deleteImageFromDrive(fileId: string) {
  try {
    const drive = getDriveClient();

    await drive.files.delete({
      fileId: fileId,
      supportsAllDrives: true,
    });

    return NextResponse.json(
      { message: "Image deleted successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error deleting image from Google Drive:", error);
    return NextResponse.json(
      { error: "Failed to delete image from Drive: " + error.message },
      { status: 500 },
    );
  }
}
