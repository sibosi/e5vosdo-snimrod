import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ImageData {
  name: string;
  url: string;
}

const sanitizeFileName = (fileName: string) => {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
};

/**
 * Ez a függvény feltölti a fájlt egy megadott tárolóba (bucket).
 * @param file – A feltölteni kívánt kép fájl (például egy File objektum).
 * @param bucket – A Supabase Storage bucket neve, ahova a fájlt menteni szeretnéd.
 * @param path – A kívánt útvonal/fájlnév a Supabase Storage-on belül (pl. "images/test.jpg").
 */
export async function uploadImage(
  file: File,
  bucket: string,
  path: string = "images",
) {
  const sanitizedFileName = sanitizeFileName(file.name);
  const sanitizedPath = `${path}/${sanitizedFileName}`;

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(sanitizedPath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Hiba történt a feltöltés során:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("Ismeretlen hiba:", err);
    return NextResponse.json({ error: "Ismeretlen hiba" }, { status: 500 });
  }
}

export async function getImages({
  bucket = "uploads",
  folderPath = "images",
}: {
  bucket: string;
  folderPath: string;
}) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folderPath, {
        limit: 100,
        offset: 0,
      });

    if (error) {
      console.error("Hiba történt a képek lekérése során:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data)
      return NextResponse.json({ error: "Nincsenek képek" }, { status: 404 });

    const images: ImageData[] = data
      .map(
        (image) =>
          image.metadata?.mimetype?.split("/")[0] === "image" && {
            name: image.name,
            url: supabase.storage
              .from(bucket)
              .getPublicUrl(folderPath + "/" + image.name).data.publicUrl,
          },
      )
      .filter((image): image is ImageData => image !== false);

    return images;
  } catch (err) {
    console.error("Ismeretlen hiba:", err);
    return NextResponse.json({ error: "Ismeretlen hiba" }, { status: 500 });
  }
}
