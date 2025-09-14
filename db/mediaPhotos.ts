import { dbreq } from "./db";
import { UserType } from "./dbreq";
import { gate } from "./permissions";

export interface MediaImageType {
  id?: number;
  datetime?: string;
  original_drive_id: string;
  original_file_name?: string;
  color?: string;
  compressed_drive_id: string;
  compressed_file_name?: string;
  compressed_width: number;
  compressed_height: number;
}

export async function getCompressedImagesFileID() {
  const images: { compressed_drive_id: string }[] = await dbreq(
    "SELECT compressed_drive_id FROM media_images ORDER BY datetime DESC",
  );
  return images.map((image) => image.compressed_drive_id);
}

export async function getOriginalImagesFileID() {
  const images: { original_drive_id: string }[] = await dbreq(
    "SELECT original_drive_id FROM media_images ORDER BY datetime DESC",
  );
  return images.map((image) => image.original_drive_id);
}

export async function getImages(selfUser: UserType) {
  gate(selfUser, "user");
  return (await dbreq(
    "SELECT * FROM media_images ORDER BY datetime DESC",
  )) as MediaImageType[];
}

/**
 * Beszúrja vagy frissíti az eredeti kép -> tömörített kép párosítást.
 * Ha már létezik a sor original_drive_id alapján, frissíti a tömörített részét.
 *
 * Paraméterek:
 * - original_drive_id (kötelező)
 * - original_file_name (opcionális)
 * - color (opcionális)
 * - compressed_drive_id (kötelező)
 * - compressed_file_name (opcionális)
 * - compressed_width (kötelező)
 * - compressed_height (kötelező)
 *
 * Visszatérési érték: a dbreq eredménye (insert/update result) — projekted dbreq implementationje
 * szerint ez lehet insertId/ok packet vagy eredmény objektum.
 */
export async function upsertMediaImage(
  selfUser: UserType,
  params: {
    original_drive_id: string;
    original_file_name?: string | null;
    color?: string | null;
    compressed_drive_id: string;
    compressed_file_name?: string | null;
    compressed_width: number;
    compressed_height: number;
  },
) {
  const {
    original_drive_id,
    original_file_name = null,
    color = null,
    compressed_drive_id,
    compressed_file_name = null,
    compressed_width,
    compressed_height,
  } = params;

  gate(selfUser, "user");

  const sql = `
    INSERT INTO media_images
      (datetime, original_drive_id, original_file_name, color, compressed_drive_id, compressed_file_name, compressed_width, compressed_height)
    VALUES (NOW(), ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      compressed_drive_id = VALUES(compressed_drive_id),
      compressed_file_name = VALUES(compressed_file_name),
      compressed_width = VALUES(compressed_width),
      compressed_height = VALUES(compressed_height),
      color = VALUES(color),
      datetime = VALUES(datetime)
  `;

  return await dbreq(sql, [
    original_drive_id,
    original_file_name,
    color,
    compressed_drive_id,
    compressed_file_name,
    compressed_width,
    compressed_height,
  ]);
}

/**
 * Tömeges beszúrás / frissítés. Hasznos, ha egyszerre több fájlt dolgozol fel.
 * Visszaad egy tömbnyi eredményt (dbreq visszatérési értékei alapján).
 */
export async function bulkUpsertMediaImages(
  selfUser: UserType,
  items: Array<{
    original_drive_id: string;
    original_file_name?: string | null;
    color?: string | null;
    compressed_drive_id: string;
    compressed_file_name?: string | null;
    compressed_width: number;
    compressed_height: number;
  }>,
) {
  gate(selfUser, "user");
  const results = [];
  for (const it of items) {
    // soronként hívjuk az upsertet: egyszerű és robusztus (ha szeretnéd, batch SQL-t is írhatunk)
    // Nem kérdezek rá up-front — az API-d a feldolgozásnál hívja majd ezt.
    // (Ha párhuzamos feldolgozás lesz, ügyelj a DB connection-limitre.)
    // eslint-disable-next-line no-await-in-loop
    const res = await upsertMediaImage(selfUser, it);
    results.push(res);
  }
  return results;
}
