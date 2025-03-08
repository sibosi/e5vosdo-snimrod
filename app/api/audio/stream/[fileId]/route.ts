import { verify } from "jsonwebtoken";
import { createReadStream, stat } from "fs";
import { promisify } from "util";
import path from "path";
import crypto from "crypto";
import { sessions } from "../../authToken/route";
import { NextRequest, NextResponse } from "next/server";

type Params = {
  fileId: string;
};

const statAsync = promisify(stat);
const JWT_SECRET = process.env.JWT_SECRET ?? "secure_audio_stream_secret";

const audioFiles: Record<string, string> = {
  "1": "edit.mp3",
  "2": "gyros.mp3",
};

export async function GET(
  req: NextRequest,
  context: { params: Promise<Params> },
) {
  if (req.method !== "GET")
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });

  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    console.log(token);

    if (!token)
      return NextResponse.json(
        { error: "Unauthorized: No token provided" },
        { status: 401 },
      );

    let decoded;
    try {
      decoded = verify(token, JWT_SECRET) as {
        userId: string;
        sessionId: string;
      };
    } catch (e) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token" },
        { status: 401 },
      );
    }

    const session = sessions[decoded.sessionId];
    if (!session || session.expires < Date.now()) {
      delete sessions[decoded.sessionId]; // Clean up expired session
      return NextResponse.json(
        { error: "Unauthorized: Session expired" },
        { status: 401 },
      );
    }

    const fileId = (await context.params).fileId;
    if (!fileId || Array.isArray(fileId) || !audioFiles[fileId]) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const filePath = path.join(process.cwd(), "podcasts", audioFiles[fileId]);

    let stats;
    try {
      stats = await statAsync(filePath);
    } catch (e) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const range = req.headers.range;
    let start = 0;
    let end = stats.size - 1;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      start = parseInt(parts[0], 10);
      end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
    }

    const chunkSize = end - start + 1;

    const timestamp = Math.floor(Date.now() / 10000);
    const encryptionKey = crypto
      .createHash("sha256")
      .update(`${decoded.sessionId}-${timestamp}-${start}`)
      .digest("hex")
      .substring(0, 32);

    const response = new NextResponse(undefined, { status: 206 });
    response.headers.set(
      "Content-Range",
      `bytes ${start}-${end}/${stats.size}`,
    );
    response.headers.set("Accept-Ranges", "bytes");
    response.headers.set("Content-Length", chunkSize.toString());
    response.headers.set("Content-Type", "audio/mpeg");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set(
      "Content-Disposition",
      'attachment; filename="audio-stream.tmp"',
    );
    response.headers.set("X-Stream-Start", start.toString());
    response.headers.set("X-Stream-Timestamp", timestamp.toString());

    const stream = new ReadableStream({
      start(controller) {
        const fileStream = createReadStream(filePath, { start, end });
        fileStream.on("data", (chunk) => {
          const encryptedChunk = Buffer.from(chunk);
          for (let i = 0; i < encryptedChunk.length; i++) {
            encryptedChunk[i] =
              encryptedChunk[i] ^
              parseInt(encryptionKey.substring(i % 32, (i % 32) + 1), 16);
          }
          controller.enqueue(encryptedChunk);
        });
        fileStream.on("end", () => {
          controller.close();
        });
        fileStream.on("error", (error) => {
          controller.error(error);
        });
      },
    });

    return new NextResponse(stream, { status: 206, headers: response.headers });
  } catch (error) {
    console.error("Error streaming audio:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
