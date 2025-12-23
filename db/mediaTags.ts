import { dbreq } from "./db";
import { UserType } from "./dbreq";
import { gate } from "./permissions";

export interface MediaTagType {
  id: number;
  tag_name: string;
  priority: "madeBy" | "normal" | "high";
}

export interface MediaImageTagRelation {
  id: number;
  media_image_id: number;
  media_image_tag_id: number;
  coordinate1_x: number | null;
  coordinate1_y: number | null;
  coordinate2_x: number | null;
  coordinate2_y: number | null;
}

export interface MediaImageWithTags {
  id: number;
  datetime?: string;
  original_drive_id: string;
  original_file_name?: string;
  color?: string;
  small_preview_drive_id?: string;
  small_preview_width?: number;
  small_preview_height?: number;
  large_preview_drive_id?: string;
  large_preview_width?: number;
  large_preview_height?: number;
  tags: Array<{
    tag_id: number;
    tag_name: string;
    coordinate1_x: number | null;
    coordinate1_y: number | null;
    coordinate2_x: number | null;
    coordinate2_y: number | null;
  }>;
}

export interface TagAttachment {
  tag_name: string;
  coordinate1_x?: number | null;
  coordinate1_y?: number | null;
  coordinate2_x?: number | null;
  coordinate2_y?: number | null;
}

// ============ Tag CRUD Operations ============

/**
 * Get all available tags
 */
export async function getAllTags(selfUser: UserType): Promise<MediaTagType[]> {
  gate(selfUser, ["user", "media_view"]);
  return (await dbreq(
    "SELECT * FROM media_images_tags ORDER BY tag_name ASC",
  )) as MediaTagType[];
}

/**
 * Create a new tag (media_admin only)
 */
export async function createTag(
  selfUser: UserType,
  tagName: string,
): Promise<number> {
  gate(selfUser, ["admin", "media_admin"]);

  const result = await dbreq(
    "INSERT INTO media_images_tags (tag_name) VALUES (?) ON DUPLICATE KEY UPDATE id = id",
    [tagName],
  );

  // If it was a duplicate, get the existing ID
  const insertResult = result as { insertId: number };
  if (insertResult.insertId === 0) {
    const existing = (await dbreq(
      "SELECT id FROM media_images_tags WHERE tag_name = ?",
      [tagName],
    )) as { id: number }[];
    return existing[0].id;
  }

  return insertResult.insertId;
}

/**
 * Delete a tag (media_admin only)
 */
export async function deleteTag(
  selfUser: UserType,
  tagId: number,
): Promise<void> {
  gate(selfUser, ["admin", "media_admin"]);
  await dbreq("DELETE FROM media_images_tags WHERE id = ?", [tagId]);
}

/**
 * Update a tag name (media_admin only)
 */
export async function updateTag(
  selfUser: UserType,
  tagId: number,
  newTagName: string,
): Promise<void> {
  gate(selfUser, ["admin", "media_admin"]);
  await dbreq("UPDATE media_images_tags SET tag_name = ? WHERE id = ?", [
    newTagName,
    tagId,
  ]);
}

// ============ Image-Tag Relations ============

/**
 * Get all tags for a specific image
 */
export async function getTagsForImage(
  selfUser: UserType,
  imageId: number,
): Promise<
  Array<{
    tag_id: number;
    tag_name: string;
    priority: "madeBy" | "normal" | "high";
    coordinate1_x: number | null;
    coordinate1_y: number | null;
    coordinate2_x: number | null;
    coordinate2_y: number | null;
  }>
> {
  gate(selfUser, ["user", "media_view"]);
  return (await dbreq(
    `SELECT 
      tags.id as tag_id, 
      tags.tag_name, 
      tags.priority,
      relatons.coordinate1_x, 
      relatons.coordinate1_y, 
      relatons.coordinate2_x, 
      relatons.coordinate2_y
    FROM media_images_to_tags relatons
    JOIN media_images_tags tags ON relatons.media_image_tag_id = tags.id
    WHERE relatons.media_image_id = ?`,
    [imageId],
  )) as any[];
}

/**
 * Attach a tag to an image (media_admin only)
 */
export async function attachTagToImage(
  selfUser: UserType,
  imageId: number,
  tagId: number,
  coordinates?: {
    coordinate1_x?: number | null;
    coordinate1_y?: number | null;
    coordinate2_x?: number | null;
    coordinate2_y?: number | null;
  },
): Promise<void> {
  gate(selfUser, ["admin", "media_admin"]);

  const { coordinate1_x, coordinate1_y, coordinate2_x, coordinate2_y } =
    coordinates || {};

  await dbreq(
    `INSERT INTO media_images_to_tags 
      (media_image_id, media_image_tag_id, coordinate1_x, coordinate1_y, coordinate2_x, coordinate2_y) 
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      coordinate1_x = VALUES(coordinate1_x),
      coordinate1_y = VALUES(coordinate1_y),
      coordinate2_x = VALUES(coordinate2_x),
      coordinate2_y = VALUES(coordinate2_y)`,
    [
      imageId,
      tagId,
      coordinate1_x ?? null,
      coordinate1_y ?? null,
      coordinate2_x ?? null,
      coordinate2_y ?? null,
    ],
  );
}

/**
 * Remove a tag from an image (media_admin only)
 */
export async function removeTagFromImage(
  selfUser: UserType,
  imageId: number,
  tagId: number,
): Promise<void> {
  gate(selfUser, ["admin", "media_admin"]);
  await dbreq(
    "DELETE FROM media_images_to_tags WHERE media_image_id = ? AND media_image_tag_id = ?",
    [imageId, tagId],
  );
}

/**
 * Bulk attach tags to multiple images (media_admin only)
 * Useful for batch tagging operations
 */
export async function bulkAttachTagsToImages(
  selfUser: UserType,
  imageIds: number[],
  tagAttachments: TagAttachment[],
): Promise<{ success: number; failed: number }> {
  gate(selfUser, ["admin", "media_admin"]);

  let success = 0;
  let failed = 0;

  for (const imageId of imageIds) {
    for (const attachment of tagAttachments) {
      try {
        // First, ensure the tag exists
        const tagId = await createTag(selfUser, attachment.tag_name);

        // Then attach it to the image
        await attachTagToImage(selfUser, imageId, tagId, {
          coordinate1_x: attachment.coordinate1_x,
          coordinate1_y: attachment.coordinate1_y,
          coordinate2_x: attachment.coordinate2_x,
          coordinate2_y: attachment.coordinate2_y,
        });
        success++;
      } catch (error) {
        console.error(
          `Failed to attach tag "${attachment.tag_name}" to image ${imageId}:`,
          error,
        );
        failed++;
      }
    }
  }

  return { success, failed };
}

/**
 * Remove all tags from an image (media_admin only)
 */
export async function removeAllTagsFromImage(
  selfUser: UserType,
  imageId: number,
): Promise<void> {
  gate(selfUser, ["admin", "media_admin"]);
  await dbreq("DELETE FROM media_images_to_tags WHERE media_image_id = ?", [
    imageId,
  ]);
}

// ============ Search Operations ============
// @sibosi TODO: Refactor
/**
 * Search images by tags (user access)
 * @param options.tagNames - Filter tags
 * @param options.matchAll - If true, all filterTags must match (AND), if false any can match (OR)
 * @param options.requiredTag - Tag that must be present on all results (always AND)
 */
export async function searchImagesByTags(
  selfUser: UserType,
  options: {
    tagNames: string[];
    matchAll?: boolean;
    requiredTag?: string | null;
  },
): Promise<MediaImageWithTags[]> {
  gate(selfUser, ["user", "media_view"]);

  const { tagNames, matchAll = false, requiredTag } = options;

  // Ha nincs se requiredTag se filterTags, üres eredmény
  if (!requiredTag && tagNames.length === 0) {
    return [];
  }

  // Ha csak requiredTag van, azt keressük
  if (requiredTag && tagNames.length === 0) {
    const query = `
      SELECT DISTINCT images.* 
      FROM media_images images
      JOIN media_images_to_tags relations ON images.id = relations.media_image_id
      JOIN media_images_tags tags ON relations.media_image_tag_id = tags.id
      WHERE tags.tag_name = ?
      ORDER BY images.datetime DESC
    `;
    const images = (await dbreq(query, [requiredTag])) as any[];
    const result: MediaImageWithTags[] = [];
    for (const img of images) {
      const imgTags = await getTagsForImage(selfUser, img.id);
      result.push({ ...img, tags: imgTags });
    }
    return result;
  }

  // Ha van requiredTag és filterTags is
  if (requiredTag && tagNames.length > 0) {
    // Először lekérjük a requiredTag-gel rendelkező képeket
    // Aztán szűrjük a filterTags alapján
    const requiredQuery = `
      SELECT DISTINCT images.id
      FROM media_images images
      JOIN media_images_to_tags relations ON images.id = relations.media_image_id
      JOIN media_images_tags tags ON relations.media_image_tag_id = tags.id
      WHERE tags.tag_name = ?
    `;
    const requiredImages = (await dbreq(requiredQuery, [requiredTag])) as {
      id: number;
    }[];

    if (requiredImages.length === 0) {
      return [];
    }

    const requiredIds = requiredImages.map((img) => img.id);
    const idPlaceholders = requiredIds.map(() => "?").join(",");
    const tagPlaceholders = tagNames.map(() => "?").join(",");

    let query: string;
    let params: (string | number)[];

    if (matchAll) {
      // Minden filterTag-nek meg kell egyeznie
      query = `
        SELECT DISTINCT images.* 
        FROM media_images images
        JOIN media_images_to_tags relations ON images.id = relations.media_image_id
        JOIN media_images_tags tags ON relations.media_image_tag_id = tags.id
        WHERE images.id IN (${idPlaceholders})
          AND tags.tag_name IN (${tagPlaceholders})
        GROUP BY images.id
        HAVING COUNT(DISTINCT tags.tag_name) = ?
        ORDER BY images.datetime DESC
      `;
      params = [...requiredIds, ...tagNames, tagNames.length];
    } else {
      // Bármelyik filterTag egyezhet (VAGY)
      query = `
        SELECT DISTINCT images.* 
        FROM media_images images
        JOIN media_images_to_tags relations ON images.id = relations.media_image_id
        JOIN media_images_tags tags ON relations.media_image_tag_id = tags.id
        WHERE images.id IN (${idPlaceholders})
          AND tags.tag_name IN (${tagPlaceholders})
        ORDER BY images.datetime DESC
      `;
      params = [...requiredIds, ...tagNames];
    }

    const images = (await dbreq(query, params)) as any[];
    const result: MediaImageWithTags[] = [];
    for (const img of images) {
      const imgTags = await getTagsForImage(selfUser, img.id);
      result.push({ ...img, tags: imgTags });
    }
    return result;
  }

  // Ha csak filterTags van (eredeti logika)
  const placeholders = tagNames.map(() => "?").join(",");

  let query: string;
  if (matchAll) {
    // All tags must match
    query = `
      SELECT DISTINCT images.* 
      FROM media_images images
      JOIN media_images_to_tags relations ON images.id = relations.media_image_id
      JOIN media_images_tags tags ON relations.media_image_tag_id = tags.id
      WHERE tags.tag_name IN (${placeholders})
      GROUP BY images.id
      HAVING COUNT(DISTINCT tags.tag_name) = ?
      ORDER BY images.datetime DESC
    `;
    tagNames.push(String(tagNames.length));
  } else {
    // Any tag matches
    query = `
      SELECT DISTINCT images.* 
      FROM media_images images
      JOIN media_images_to_tags relations ON images.id = relations.media_image_id
      JOIN media_images_tags tags ON relations.media_image_tag_id = tags.id
      WHERE tags.tag_name IN (${placeholders})
      ORDER BY images.datetime DESC
    `;
  }

  const images = (await dbreq(query, tagNames)) as any[];

  // Fetch tags for each image
  const result: MediaImageWithTags[] = [];
  for (const img of images) {
    const imgTags = await getTagsForImage(selfUser, img.id);
    result.push({ ...img, tags: imgTags });
  }

  return result;
}

/**
 * Get all images with their tags (for admin panel) - with pagination
 */
export async function getAllImagesWithTags(
  selfUser: UserType,
  options?: { limit?: number; offset?: number },
): Promise<{ images: MediaImageWithTags[]; total: number; hasMore: boolean }> {
  gate(selfUser, ["admin", "media_admin"]);

  const limit = Math.max(1, Math.min(options?.limit ?? 20, 100)); // Min 1, Max 100
  const offset = Math.max(0, options?.offset ?? 0);

  // Get total count
  const countResult = (await dbreq(
    "SELECT COUNT(*) as total FROM media_images",
  )) as { total: number }[];
  const total = countResult[0]?.total ?? 0;

  // Get paginated images - use LIMIT without parameterization for better compatibility
  const query = `
    SELECT * FROM media_images 
    ORDER BY datetime DESC 
    LIMIT ${limit} OFFSET ${offset}
  `;
  const images = (await dbreq(query)) as any[];

  // Batch fetch all tags for these images in one query
  if (images.length === 0) return { images: [], total, hasMore: false };

  const imageIds = images.map((img) => img.id);
  const placeholders = imageIds.map(() => "?").join(",");

  const allTags = (await dbreq(
    `SELECT 
      relatons.media_image_id,
      tags.id as tag_id, 
      tags.tag_name, 
      relatons.coordinate1_x, 
      relatons.coordinate1_y, 
      relatons.coordinate2_x, 
      relatons.coordinate2_y
    FROM media_images_to_tags relatons
    JOIN media_images_tags tags ON relatons.media_image_tag_id = tags.id
    WHERE relatons.media_image_id IN (${placeholders})`,
    imageIds,
  )) as any[];

  // Group tags by image ID
  const tagsByImageId = new Map<number, any[]>();
  for (const tag of allTags) {
    const imgId = tag.media_image_id;
    if (!tagsByImageId.has(imgId)) {
      tagsByImageId.set(imgId, []);
    }
    tagsByImageId.get(imgId)!.push({
      tag_id: tag.tag_id,
      tag_name: tag.tag_name,
      coordinate1_x: tag.coordinate1_x,
      coordinate1_y: tag.coordinate1_y,
      coordinate2_x: tag.coordinate2_x,
      coordinate2_y: tag.coordinate2_y,
    });
  }

  // Combine images with their tags
  const result: MediaImageWithTags[] = images.map((img) => ({
    ...img,
    tags: tagsByImageId.get(img.id) || [],
  }));

  return {
    images: result,
    total,
    hasMore: offset + images.length < total,
  };
}

/**
 * Get image by original filename (for XML import matching)
 */
export async function getImageByOriginalFileName(
  selfUser: UserType,
  fileName: string,
): Promise<{ id: number; original_file_name: string } | null> {
  gate(selfUser, ["admin", "media_admin"]);

  // Match without extension
  const baseFileName = fileName.replace(/\.[^.]+$/, "");

  const images = (await dbreq(
    `SELECT id, original_file_name FROM media_images 
     WHERE original_file_name LIKE ? OR original_file_name LIKE ?`,
    [`${baseFileName}.%`, baseFileName],
  )) as { id: number; original_file_name: string }[];

  return images.length > 0 ? images[0] : null;
}

/**
 * Get tag usage statistics (media_admin only)
 */
export async function getTagStats(
  selfUser: UserType,
): Promise<
  Array<{
    tag_id: number;
    tag_name: string;
    usage_count: number;
    priority: "madeBy" | "normal" | "high";
  }>
> {
  gate(selfUser, ["admin", "media_admin"]);

  return (await dbreq(`
    SELECT 
      tags.id as tag_id, 
      tags.tag_name, 
      tags.priority,
      COUNT(relatons.id) as usage_count
    FROM media_images_tags tags
    LEFT JOIN media_images_to_tags relatons
      ON tags.id = relatons.media_image_tag_id
    GROUP BY tags.id, tags.tag_name, tags.priority
    ORDER BY usage_count DESC, tags.tag_name ASC
  `)) as any[];
}

/**
 * Update a tag's priority (media_admin only)
 */
export async function updateTagPriority(
  selfUser: UserType,
  tagId: number,
  priority: "madeBy" | "normal" | "high",
): Promise<void> {
  gate(selfUser, ["admin", "media_admin"]);
  await dbreq("UPDATE media_images_tags SET priority = ? WHERE id = ?", [
    priority,
    tagId,
  ]);
}
