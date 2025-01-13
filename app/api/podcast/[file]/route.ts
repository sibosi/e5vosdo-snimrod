import { statSync, createReadStream } from "fs";
import { resolve } from "path";
import { NextResponse } from "next/server";
import { getAuth } from "@/db/dbreq";

const podcastDirectory = resolve("./podcasts"); // Bizonyosodj meg arról, hogy a helyes elérési utat adod meg

type Params = {
  file: string;
};

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) => {
  const selfUser = await getAuth();
  if (!selfUser) {
    return NextResponse.json(
      { error: "Please log in to use this API" },
      { status: 400 },
    );
  }

  const filename = (await params).slug;

  if (!filename) {
    return NextResponse.json(
      { error: "Filename is required" },
      { status: 400 },
    );
  }

  // Fájl elérési útjának meghatározása
  const filePath = resolve(podcastDirectory, `${filename}`);

  try {
    // Ellenőrizzük, hogy a fájl létezik-e és megkapjuk a statisztikáját
    const fileStat = statSync(filePath);

    // Fájl streamelésének előkészítése
    const readStream = createReadStream(filePath);

    // Next.js response létrehozása streammel
    const response = new NextResponse(readStream as any, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": fileStat.size.toString(),
      },
    });

    return response;
  } catch (error) {
    // Hibakezelés, ha a fájl nem található
    return NextResponse.json(
      { error: "File not found " + filename },
      { status: 404 },
    );
  }
};

export const POST = async (
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) => {
  return await GET(request, { params });
};
