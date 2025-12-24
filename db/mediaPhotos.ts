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

export async function getImages(
  selfUser: UserType,
  byName = false,
): Promise<MediaImageType[]> {
  gate(selfUser, "user");
  if (byName) {
    return (await dbreq(
      "SELECT * FROM media_images ORDER BY original_file_name DESC",
    )) as MediaImageType[];
  } else {
    return (await dbreq(
      "SELECT * FROM media_images ORDER BY datetime DESC",
    )) as MediaImageType[];
  }
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
 * - color (opcionális) - domináns szín
 * - datetime (opcionális) - kép készítésének időpontja (EXIF-ből)
 * - upload_datetime (opcionális) - Drive feltöltés időpontja
 *
 * Visszatérési érték: a dbreq eredménye (insert/update result)
 */
export async function upsertMediaImage(
  selfUser: UserType,
  params: {
    original_drive_id: string;
    original_file_name?: string | null;
    color?: string | null;
    datetime?: string | null; // EXIF capture time (ISO string)
    upload_datetime?: string | null; // Drive upload time (ISO string)
  },
) {
  const {
    original_drive_id,
    original_file_name = null,
    color = null,
    datetime = null,
    upload_datetime = null,
  } = params;

  gate(selfUser, "user");

  // Ha nincs upload_datetime, használjunk JS ISO stringet (VARCHAR-ban tároljuk)
  const effectiveUploadDatetime = upload_datetime ?? new Date().toISOString();

  const sql = `
    INSERT INTO media_images
      (datetime, upload_datetime, original_drive_id, original_file_name, color)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      original_file_name = COALESCE(VALUES(original_file_name), original_file_name),
      color = COALESCE(VALUES(color), color),
      datetime = COALESCE(VALUES(datetime), datetime)
  `;

  return await dbreq(sql, [
    datetime,
    effectiveUploadDatetime,
    original_drive_id,
    original_file_name,
    color,
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

/**
 * Töröl egy képet az adatbázisból (és a kapcsolódó tag-eket is).
 * A Drive-ról való törlést külön kell kezelni!
 */
export async function deleteImage(
  selfUser: UserType,
  imageId: number,
): Promise<{ success: boolean; deletedDriveIds: string[] }> {
  gate(selfUser, ["admin", "media_admin"]);

  const image = await getImageById(imageId);
  if (!image) return { success: false, deletedDriveIds: [] };

  const driveIds: string[] = [];
  if (image.original_drive_id) driveIds.push(image.original_drive_id);
  if (image.small_preview_drive_id) driveIds.push(image.small_preview_drive_id);
  if (image.large_preview_drive_id) driveIds.push(image.large_preview_drive_id);

  await dbreq("DELETE FROM media_images_to_tags WHERE media_image_id = ?", [
    imageId,
  ]);

  await dbreq("DELETE FROM media_images WHERE id = ?", [imageId]);

  return { success: true, deletedDriveIds: driveIds };
}

/**
 * Töröl több képet egyszerre.
 */
export async function deleteImages(
  selfUser: UserType,
  imageIds: number[],
): Promise<{ success: number; failed: number; deletedDriveIds: string[] }> {
  gate(selfUser, ["admin", "media_admin"]);

  let success = 0;
  let failed = 0;
  const allDriveIds: string[] = [];

  for (const imageId of imageIds) {
    try {
      const result = await deleteImage(selfUser, imageId);
      if (result.success) {
        success++;
        allDriveIds.push(...result.deletedDriveIds);
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`Failed to delete image ${imageId}:`, error);
      failed++;
    }
  }

  return { success, failed, deletedDriveIds: allDriveIds };
}

/**
 * Reseteli (törli) egy kép preview-jait az adatbázisból.
 * A Drive-ról és a helyi cache-ből is törölni kell külön!
 */
export async function resetImagePreviews(
  selfUser: UserType,
  imageId: number,
): Promise<{ success: boolean; deletedDriveIds: string[] }> {
  gate(selfUser, ["admin", "media_admin"]);

  const image = await getImageById(imageId);
  if (!image) {
    return { success: false, deletedDriveIds: [] };
  }

  const driveIds: string[] = [];
  if (image.small_preview_drive_id) driveIds.push(image.small_preview_drive_id);
  if (image.large_preview_drive_id) driveIds.push(image.large_preview_drive_id);

  await dbreq(
    `UPDATE media_images SET 
      small_preview_drive_id = NULL, 
      small_preview_width = NULL, 
      small_preview_height = NULL,
      large_preview_drive_id = NULL, 
      large_preview_width = NULL, 
      large_preview_height = NULL
    WHERE id = ?`,
    [imageId],
  );

  return { success: true, deletedDriveIds: driveIds };
}

/**
 * Reseteli több kép preview-jait egyszerre.
 */
export async function resetImagesPreviews(
  selfUser: UserType,
  imageIds: number[],
): Promise<{ success: number; failed: number; deletedDriveIds: string[] }> {
  gate(selfUser, ["admin", "media_admin"]);

  let success = 0;
  let failed = 0;
  const allDriveIds: string[] = [];

  for (const imageId of imageIds) {
    try {
      const result = await resetImagePreviews(selfUser, imageId);
      if (result.success) {
        success++;
        allDriveIds.push(...result.deletedDriveIds);
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`Failed to reset previews for image ${imageId}:`, error);
      failed++;
    }
  }

  return { success, failed, deletedDriveIds: allDriveIds };
}
