import { NextRequest, NextResponse } from "next/server";
import { getImagesFromDrive } from "@/db/driveStorage";

export async function GET(req: NextRequest) {
  try {
    // Allow both authenticated users and public access for viewing images
    // You can restrict this to only authenticated users if needed

    const cameraFolderId = process.env.CAMERA_PHOTOS_DRIVE_FOLDER_ID;
    if (!cameraFolderId) {
      return NextResponse.json(
        { error: "Camera photos Drive folder ID not configured" },
        { status: 500 },
      );
    }

    const images = await getImagesFromDrive(cameraFolderId);

    return NextResponse.json(images, { status: 200 });
  } catch (error) {
    console.error("Error fetching camera photos:", error);
    return NextResponse.json(
      { error: "Failed to fetch camera photos" },
      { status: 500 },
    );
  }
}
