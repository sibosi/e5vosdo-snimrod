import { dbreq } from "./db";
import { UserType } from "./dbreq";
import { gate } from "./permissions";

export interface XmlImportRecord {
  id: number;
  drive_id: string;
  file_name: string;
  imported_at: string;
  matched_image_id: number | null;
  tags_imported: number;
}

/**
 * Get all imported XML file drive IDs
 */
export async function getImportedXmlDriveIds(): Promise<string[]> {
  const records = (await dbreq("SELECT drive_id FROM media_xml_imports")) as {
    drive_id: string;
  }[];
  return records.map((r) => r.drive_id);
}

/**
 * Get import history with details
 */
export async function getXmlImportHistory(
  selfUser: UserType,
  limit: number = 100,
): Promise<XmlImportRecord[]> {
  gate(selfUser, ["admin", "media_admin"]);
  return (await dbreq(
    `SELECT * FROM media_xml_imports ORDER BY imported_at DESC LIMIT ?`,
    [limit],
  )) as XmlImportRecord[];
}

/**
 * Record an XML import
 */
export async function recordXmlImport(
  selfUser: UserType,
  driveId: string,
  fileName: string,
  matchedImageId: number | null,
  tagsImported: number,
): Promise<number> {
  gate(selfUser, ["admin", "media_admin"]);

  const result = await dbreq(
    `INSERT INTO media_xml_imports 
      (drive_id, file_name, imported_at, matched_image_id, tags_imported) 
    VALUES (?, ?, NOW(), ?, ?)
    ON DUPLICATE KEY UPDATE 
      imported_at = NOW(),
      matched_image_id = VALUES(matched_image_id),
      tags_imported = VALUES(tags_imported)`,
    [driveId, fileName, matchedImageId, tagsImported],
  );

  return (result as { insertId: number }).insertId;
}

/**
 * Check if specific XML files have been imported
 */
export async function checkXmlImported(
  driveIds: string[],
): Promise<Map<string, boolean>> {
  if (driveIds.length === 0) return new Map();

  const placeholders = driveIds.map(() => "?").join(",");
  const records = (await dbreq(
    `SELECT drive_id FROM media_xml_imports WHERE drive_id IN (${placeholders})`,
    driveIds,
  )) as { drive_id: string }[];

  const importedSet = new Set(records.map((r) => r.drive_id));
  const result = new Map<string, boolean>();

  for (const id of driveIds) {
    result.set(id, importedSet.has(id));
  }

  return result;
}
