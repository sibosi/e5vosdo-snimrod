import { createClient } from "@supabase/supabase-js";

// Hozd létre a Supabase kliensedet a projekt URL és a publikus kulcs (anon key) segítségével
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Ez a függvény feltölti a fájlt egy megadott tárolóba (bucket).
 * @param file – A feltölteni kívánt kép fájl (például egy File objektum).
 * @param bucket – A Supabase Storage bucket neve, ahova a fájlt menteni szeretnéd.
 * @param path – A kívánt útvonal/fájlnév a Supabase Storage-on belül (pl. "images/test.jpg").
 */
export default async function uploadImage(
  file: File,
  bucket: string,
  path: string,
) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Hiba történt a feltöltés során:", error.message);
      return error;
    }
    console.log("Sikeres feltöltés:", data);
    return data;
  } catch (err) {
    console.error("Ismeretlen hiba:", err);
    return err;
  }
}

// Példa használat (pl. böngészőben egy <input type="file"> elemmel):
// const fileInput = document.querySelector('input[type="file"]')!
// fileInput.addEventListener('change', (event) => {
//   const file = (event.target as HTMLInputElement).files?.[0]
//   if (file) {
//     uploadImage(file, 'example-bucket', `images/${file.name}`)
//   }
// })
