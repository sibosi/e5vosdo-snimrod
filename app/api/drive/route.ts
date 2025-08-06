import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    const folderId = process.env.MEDIA_FOLDER_ID;
    if (!folderId) throw new Error("MEDIA_FOLDER_ID is not set in environment");

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.SERVICE_ACCOUNT_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth });

    let files: Array<{
      id: string;
      name: string;
      mimeType: string;
      webViewLink: string;
    }> = [];
    let pageToken: string | undefined = undefined;

    do {
      const driveRes: any = await drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: "nextPageToken, files(id, name, mimeType, webViewLink)",
        orderBy: "folder, name",
        pageSize: 100,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        pageToken,
      });

      if (driveRes.data.files) {
        files = files.concat(
          driveRes.data.files.map((f: any) => ({
            id: f.id!,
            name: f.name!,
            mimeType: f.mimeType!,
            webViewLink: f.webViewLink!,
          })),
        );
      }
      pageToken = driveRes.data.nextPageToken!;
    } while (pageToken);

    return NextResponse.json({ files }, { status: 200 });
  } catch (err: any) {
    console.error("Drive API error:", err);
    const status = err.code || 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
