import { getAuth } from "@/db/dbreq";
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { verifyImageToken } from "@/db/imageAuth";

type Params = {
  fileId: string;
};

export async function GET(
  request: Request,
  context: { params: Promise<Params> },
) {
  const fileId = (await context.params).fileId;
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!fileId)
    return NextResponse.json({ error: "File ID is required" }, { status: 400 });

  if (token) {
    const tokenPayload = verifyImageToken(token);
    if (!tokenPayload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }
  } else {
    const selfUser = await getAuth();
    if (!selfUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  if (!process.env.SERVICE_ACCOUNT_EMAIL)
    return NextResponse.json(
      { error: "SERVICE_ACCOUNT_EMAIL is not set in environment" },
      { status: 500 },
    );
  if (!process.env.SERVICE_ACCOUNT_KEY_STR)
    return NextResponse.json(
      { error: "SERVICE_ACCOUNT_KEY_STR is not set in environment" },
      { status: 500 },
    );

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
