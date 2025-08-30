import { dbreq } from "./db";

export interface MediaImage {
  id?: number;
  datetime?: string;
  original_drive_id: string;
  original_file_name?: string;
  color?: string;
  compressed_drive_id: string;
  compressed_file_name?: string;
  compressed_square_size?: number;
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
 * - compressed_square_size (opcionális)
 *
 * Visszatérési érték: a dbreq eredménye (insert/update result) — projekted dbreq implementationje
 * szerint ez lehet insertId/ok packet vagy eredmény objektum.
 */
export async function upsertMediaImage(params: {
  original_drive_id: string;
  original_file_name?: string | null;
  color?: string | null;
  compressed_drive_id: string;
  compressed_file_name?: string | null;
  compressed_square_size?: number | null;
}) {
  const {
    original_drive_id,
    original_file_name = null,
    color = null,
    compressed_drive_id,
    compressed_file_name = null,
    compressed_square_size = null,
  } = params;

  const sql = `
    INSERT INTO media_images
      (datetime, original_drive_id, original_file_name, color, compressed_drive_id, compressed_file_name, compressed_square_size)
    VALUES (NOW(), ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      compressed_drive_id = VALUES(compressed_drive_id),
      compressed_file_name = VALUES(compressed_file_name),
      compressed_square_size = VALUES(compressed_square_size),
      color = VALUES(color),
      datetime = VALUES(datetime)
  `;

  return await dbreq(sql, [
    original_drive_id,
    original_file_name,
    color,
    compressed_drive_id,
    compressed_file_name,
    compressed_square_size,
  ]);
}

/**
 * Tömeges beszúrás / frissítés. Hasznos, ha egyszerre több fájlt dolgozol fel.
 * Visszaad egy tömbnyi eredményt (dbreq visszatérési értékei alapján).
 */
export async function bulkUpsertMediaImages(
  items: Array<{
    original_drive_id: string;
    original_file_name?: string | null;
    color?: string | null;
    compressed_drive_id: string;
    compressed_file_name?: string | null;
    compressed_square_size?: number | null;
  }>,
) {
  const results = [];
  for (const it of items) {
    // soronként hívjuk az upsertet: egyszerű és robusztus (ha szeretnéd, batch SQL-t is írhatunk)
    // Nem kérdezek rá up-front — az API-d a feldolgozásnál hívja majd ezt.
    // (Ha párhuzamos feldolgozás lesz, ügyelj a DB connection-limitre.)
    // eslint-disable-next-line no-await-in-loop
    const res = await upsertMediaImage(it);
    results.push(res);
  }
  return results;
}
