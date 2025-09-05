import { readdirSync } from "fs";
import { join } from "path";
import { ImageData, getImages as getDBImages } from "./supabaseStorage";

export async function getImages() {
  const DIRS = ["groups", "events"];
  let images: ImageData[] = [];
  for (const dir of DIRS) {
    const files = readdirSync(join(process.cwd(), "public", dir));
    for (const file of files) {
      images.push({
        name: file,
        url: `/${dir}/${file}`,
        folder: dir,
      });
    }
  }
  const dbimages = await getDBImages({
    bucket: "uploads",
    folderPath: "images",
  });
  if (dbimages instanceof Array) return [...images, ...dbimages];
  else return images;
}
