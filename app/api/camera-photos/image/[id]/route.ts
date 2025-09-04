import { NextRequest, NextResponse } from "next/server";
import { getDriveClient } from "@/db/autobackup";

// In-memory cache for images
const imageCache = new Map<
  string,
  { buffer: Buffer; mimeType: string; timestamp: number }
>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 },
      );
    }

    // Check if image is in cache and still valid
    const cached = imageCache.get(id);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`Serving cached image for ID: ${id}`);
      return new NextResponse(cached.buffer as any, {
        status: 200,
        headers: {
          "Content-Type": cached.mimeType,
          "Cache-Control": "public, max-age=86400", // Cache for 24 hours
          "X-Cache-Status": "HIT",
        },
      });
    }

    console.log(`Downloading image from Drive for ID: ${id}`);
    const drive = getDriveClient();

    // Get file from Google Drive
    const response = await drive.files.get(
      {
        fileId: id,
        alt: "media", // This downloads the actual file content
        supportsAllDrives: true,
      },
      { responseType: "stream" },
    );

    // Get file metadata to determine content type
    const metadata = await drive.files.get({
      fileId: id,
      fields: "mimeType, name",
      supportsAllDrives: true,
    });

    const mimeType = metadata.data.mimeType || "image/jpeg";

    // Convert the stream to buffer
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      response.data.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      response.data.on("end", () => {
        const buffer = Buffer.concat(chunks);

        // Cache the image
        imageCache.set(id, {
          buffer,
          mimeType,
          timestamp: Date.now(),
        });

        console.log(
          `Cached image for ID: ${id}, cache size: ${imageCache.size}`,
        );

        resolve(
          new NextResponse(buffer as any, {
            status: 200,
            headers: {
              "Content-Type": mimeType,
              "Cache-Control": "public, max-age=86400", // Cache for 24 hours
              "X-Cache-Status": "MISS",
            },
          }),
        );
      });

      response.data.on("error", (error: any) => {
        console.error("Stream error:", error);
        reject(
          NextResponse.json(
            { error: "Failed to fetch image" },
            { status: 500 },
          ),
        );
      });
    });
  } catch (error: any) {
    console.error("Error fetching image from Drive:", error);
    return NextResponse.json(
      { error: "Failed to fetch image: " + error.message },
      { status: 500 },
    );
  }
}
