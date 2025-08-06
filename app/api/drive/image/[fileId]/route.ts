import { getAuth } from "@/db/dbreq";
import { NextResponse } from "next/server";
import { google } from "googleapis";

type Params = {
  fileId: string;
};

export async function GET(
  request: Request,
  context: { params: Promise<Params> },
) {
  const selfUser = await getAuth();
  const fileId = (await context.params).fileId;

  if (!selfUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!fileId) {
    return NextResponse.json({ error: "File ID is required" }, { status: 400 });
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
      { fileId, alt: "media" },
      { responseType: "arraybuffer" },
    );
    return new Response(driveRes.data as any, {
      headers: {
        "Content-Type":
          driveRes.headers["content-type"] || "application/octet-stream",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: err.code || 500 },
    );
  }
}
