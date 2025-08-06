import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  const folderId = process.env.MEDIA_FOLDER_ID;
  if (!folderId) {
    return NextResponse.json(
      { error: "MEDIA_FOLDER_ID nincs beállítva." },
      { status: 500 },
    );
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.SERVICE_ACCOUNT_KEY_STR?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: "files(id,name,mimeType)",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  const files = res.data.files || [];
  const withLinks = await Promise.all(
    files.map(async (f) => {
      const meta = await drive.files.get({
        fileId: f.id!,
        fields: "webContentLink",
        supportsAllDrives: true,
        supportsTeamDrives: true,
      });
      return { id: f.id!, name: f.name!, url: meta.data.webContentLink! };
    }),
  );

  return NextResponse.json({ files: withLinks });
}
