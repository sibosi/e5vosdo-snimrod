import { NextRequest, NextResponse } from "next/server";
import { dbreq } from "@/db/db";
import { getAuth } from "@/db/dbreq";
import { gate } from "@/db/permissions";
import { z } from "zod";

const videoSchema = z.object({
  title: z.string().min(3, "A cím legalább 3 karakter hosszú kell legyen."),
  url: z.url(),
});

export async function POST(req: NextRequest) {
  try {
    const selfUser = await getAuth();
    if (!selfUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    gate(selfUser, ["admin", "media_admin"]);

    const body = await req.json();
    const validation = videoSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message ?? "Érvénytelen adatok." },
        { status: 400 },
      );
    }

    const { title, url } = validation.data;

    const videoId = extractYouTubeId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: "Érvénytelen YouTube URL." },
        { status: 400 },
      );
    }

    const normalizedEmbedUrl = `https://www.youtube.com/embed/${videoId}`;
    const syntheticDriveId = `youtube:${videoId}`;

    // Already exists? Update title and return existing id.
    const existing = (await dbreq(
      "SELECT id FROM media_images WHERE original_drive_id = ? LIMIT 1",
      [syntheticDriveId],
    )) as { id: number }[];
    if (existing[0]?.id) {
      await dbreq(
        "UPDATE media_images SET original_file_name = ?, media_type = 'video', video_url = ? WHERE id = ?",
        [title, normalizedEmbedUrl, existing[0].id],
      );
      return NextResponse.json({ success: true, id: existing[0].id });
    }

    await dbreq(
      `INSERT INTO media_images
      (upload_datetime, original_drive_id, original_file_name, color, small_preview_width, small_preview_height, large_preview_width, large_preview_height, media_type, video_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'video', ?)`,
      [
        new Date().toISOString(),
        syntheticDriveId,
        title,
        "#000000",
        480,
        360,
        1280,
        720,
        normalizedEmbedUrl,
      ],
    );

    const inserted = (await dbreq(
      "SELECT id FROM media_images WHERE original_drive_id = ? LIMIT 1",
      [syntheticDriveId],
    )) as { id: number }[];

    return NextResponse.json(
      { success: true, id: inserted[0]?.id ?? null },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error adding video:", error);
    return NextResponse.json(
      { error: "Hiba történt a videó hozzáadásakor." },
      { status: 500 },
    );
  }
}

function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      const shortId = parsed.pathname.replace(/^\//, "").trim();
      return shortId.length === 11 ? shortId : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const fromQuery = parsed.searchParams.get("v");
      if (fromQuery?.length === 11) {
        return fromQuery;
      }

      const pathParts = parsed.pathname.split("/").filter(Boolean);
      const embedIndex = pathParts.indexOf("embed");
      if (embedIndex >= 0) {
        const embedId = pathParts[embedIndex + 1];
        return embedId?.length === 11 ? embedId : null;
      }
    }

    return null;
  } catch {
    return null;
  }
}
