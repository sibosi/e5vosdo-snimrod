import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Get the chunk size from query parameter or use default (1MB)
  const url = new URL(request.url);
  const chunkSize = Number.parseInt(
    url.searchParams.get("size") || (1024 * 1024).toString(), // 1MB chunks by default
  );

  // Create a chunk of data
  const chunk = Buffer.alloc(chunkSize, "x");

  // Set headers for streaming
  const headers = {
    "Content-Type": "application/octet-stream",
    "Cache-Control": "no-cache",
    "Content-Disposition": 'attachment; filename="speedtest"',
  };

  try {
    const stream = new ReadableStream({
      start(controller) {
        let bytesSent = 0;
        const TARGET_SIZE = 1024 * 1024 * 1024; // 1GB

        const sendChunk = () => {
          if (bytesSent < TARGET_SIZE) {
            controller.enqueue(chunk);
            bytesSent += chunk.length;
            setTimeout(sendChunk, 0);
          } else {
            controller.close();
          }
        };

        sendChunk();
      },
    });

    return new NextResponse(stream, { headers });
  } catch (error: unknown) {
    console.error("Speed test error:", error);
    return NextResponse.json(
      { error: "Failed to generate speed test" },
      { status: 500 },
    );
  }
}
