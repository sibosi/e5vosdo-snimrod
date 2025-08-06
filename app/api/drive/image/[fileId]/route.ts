export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(
  request: Request,
  context: { params: Promise<{ fileId: string }> },
) {
  const { fileId } = await context.params;
  if (!fileId) {
    return NextResponse.json({ error: "Hiányzó fileId" }, { status: 400 });
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.SERVICE_ACCOUNT_KEY_STR?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  const drive = google.drive({ version: "v3", auth });

  try {
    const driveRes = await drive.files.get(
      {
        fileId,
        alt: "media",
        supportsAllDrives: true,
      },
      { responseType: "stream" },
    );
    const stream = driveRes.data;

    // @ts-expect-error - The types are compatible but TypeScript doesn't think so.
    return new Response(stream, {
      headers: {
        "Content-Type":
          driveRes.headers["content-type"] || "application/octet-stream",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: err.code || 500 },
    );
  }
}
