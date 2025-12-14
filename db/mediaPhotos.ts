import { dbreq } from "./db";
import { UserType } from "./dbreq";
import { gate } from "./permissions";

export interface MediaImageType {
  id: number;
  datetime?: string;
  original_drive_id: string;
  original_file_name?: string;
  color?: string;
  // Kis preview (thumbnail) - Drive-on tárolva
  small_preview_drive_id?: string;
  small_preview_width?: number;
  small_preview_height?: number;
  // Nagy preview (modal) - Drive-on tárolva
  large_preview_drive_id?: string;
  large_preview_width?: number;
  large_preview_height?: number;
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
 * Lekér egy képet ID alapján (belső használatra, auth nélkül).
 */
export async function getImageById(id: number): Promise<MediaImageType | null> {
  const images = (await dbreq("SELECT * FROM media_images WHERE id = ?", [
    id,
  ])) as MediaImageType[];
  return images.length > 0 ? images[0] : null;
}

/**
 * Frissíti a preview Drive ID-t és méreteket egy képhez.
 */
export async function updateImagePreview(
  imageId: number,
  size: "small" | "large",
  driveId: string,
  width: number,
  height: number,
): Promise<void> {
  if (size === "small") {
    await dbreq(
      "UPDATE media_images SET small_preview_drive_id = ?, small_preview_width = ?, small_preview_height = ? WHERE id = ?",
      [driveId, width, height, imageId],
    );
  } else {
    await dbreq(
      "UPDATE media_images SET large_preview_drive_id = ?, large_preview_width = ?, large_preview_height = ? WHERE id = ?",
      [driveId, width, height, imageId],
    );
  }
}

/**
 * Beszúrja vagy frissíti az eredeti kép bejegyzést.
 * Ha már létezik a sor original_drive_id alapján, frissíti az adatokat.
 *
 * Paraméterek:
 * - original_drive_id (kötelező)
 * - original_file_name (opcionális)
 * - color (opcionális)
 *
 * Visszatérési érték: a dbreq eredménye (insert/update result)
 */
export async function upsertMediaImage(
  selfUser: UserType,
  params: {
    original_drive_id: string;
    original_file_name?: string | null;
    color?: string | null;
  },
) {
  const { original_drive_id, original_file_name = null, color = null } = params;

  gate(selfUser, "user");

  const sql = `
    INSERT INTO media_images
      (datetime, original_drive_id, original_file_name, color)
    VALUES (NOW(), ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      original_file_name = VALUES(original_file_name),
      color = VALUES(color),
      datetime = VALUES(datetime)
  `;

  return await dbreq(sql, [original_drive_id, original_file_name, color]);
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
  }>,
) {
  gate(selfUser, "user");
  const results = [];
  for (const it of items) {
    // soronként hívjuk az upsertet: egyszerű és robusztus
    // eslint-disable-next-line no-await-in-loop
    const res = await upsertMediaImage(selfUser, it);
    results.push(res);
  }
  return results;
}
