import { dbreq } from "./db";
import type {
  FeedInstagramAccount,
  FeedInstagramPost,
} from "@/lib/feedInstagram";

export type FeedMediaRecord = {
  id: string;
  postId: string;
  mediaType: string;
  displayUrl: string;
  position: number;
  driveFileId?: string | null;
  driveMimeType?: string | null;
  driveMd5?: string | null;
};

export type FeedDbPostRow = {
  id: string;
  account_username: string;
  caption: string | null;
  media_type: string;
  display_url: string | null;
  permalink: string | null;
  timestamp: string | null;
  timestamp_epoch: number | null;
  like_count: number | null;
  comments_count: number | null;
  profile_picture_url?: string | null;
};

export type FeedDbMediaRow = {
  id: string;
  post_id: string;
  media_type: string;
  display_url: string | null;
  position: number;
  drive_file_id: string | null;
  drive_mime_type: string | null;
  drive_md5: string | null;
};

export type FeedDbPageResult = {
  posts: FeedDbPostRow[];
  mediaItems: FeedDbMediaRow[];
  hasMore: boolean;
};

function buildInPlaceholders(items: unknown[]) {
  return items.map(() => "?").join(", ");
}

function parseTimestampEpoch(timestamp?: string | null) {
  if (!timestamp) return 0;
  const parsed = Date.parse(timestamp);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export async function upsertFeedAccounts(accounts: FeedInstagramAccount[]) {
  if (accounts.length === 0) return;

  for (const account of accounts) {
    await dbreq(
      "INSERT INTO feed_instagram_accounts (username, profile_picture_url, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE profile_picture_url = VALUES(profile_picture_url), updated_at = CURRENT_TIMESTAMP",
      [account.username, account.profilePictureUrl],
    );
  }
}

export async function upsertFeedPosts(posts: FeedInstagramPost[]) {
  if (posts.length === 0) return;

  for (const post of posts) {
    const timestampEpoch = parseTimestampEpoch(post.timestamp);
    await dbreq(
      "INSERT INTO feed_instagram_posts (id, account_username, caption, media_type, display_url, permalink, timestamp, timestamp_epoch, like_count, comments_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE account_username = VALUES(account_username), caption = VALUES(caption), media_type = VALUES(media_type), display_url = VALUES(display_url), permalink = VALUES(permalink), timestamp = VALUES(timestamp), timestamp_epoch = VALUES(timestamp_epoch), like_count = VALUES(like_count), comments_count = VALUES(comments_count), updated_at = CURRENT_TIMESTAMP",
      [
        post.id,
        post.account.username,
        post.caption,
        post.mediaType,
        post.displayUrl,
        post.permalink,
        post.timestamp,
        timestampEpoch,
        post.likeCount,
        post.commentsCount,
      ],
    );
  }
}

export async function upsertFeedMediaItems(items: FeedMediaRecord[]) {
  if (items.length === 0) return;

  for (const item of items) {
    await dbreq(
      "INSERT INTO feed_instagram_media (id, post_id, media_type, display_url, position, drive_file_id, drive_mime_type, drive_md5, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE post_id = VALUES(post_id), media_type = VALUES(media_type), display_url = VALUES(display_url), position = VALUES(position), drive_file_id = COALESCE(VALUES(drive_file_id), drive_file_id), drive_mime_type = COALESCE(VALUES(drive_mime_type), drive_mime_type), drive_md5 = COALESCE(VALUES(drive_md5), drive_md5), updated_at = CURRENT_TIMESTAMP",
      [
        item.id,
        item.postId,
        item.mediaType,
        item.displayUrl,
        item.position,
        item.driveFileId ?? null,
        item.driveMimeType ?? null,
        item.driveMd5 ?? null,
      ],
    );
  }
}

export async function getFeedPostsPage(options: {
  filterUsernames?: string[];
  after?: { timestampEpoch: number; id: string } | null;
  limit: number;
}): Promise<FeedDbPageResult> {
  const parsedLimit = Number(options.limit);
  const limit = Number.isFinite(parsedLimit)
    ? Math.max(1, Math.floor(parsedLimit))
    : 20;
  const params: Array<string | number> = [];
  const where: string[] = [];

  if (options.filterUsernames && options.filterUsernames.length > 0) {
    where.push(
      `p.account_username IN (${buildInPlaceholders(options.filterUsernames)})`,
    );
    params.push(...options.filterUsernames);
  }

  if (options.after) {
    where.push(
      "(COALESCE(p.timestamp_epoch, 0) < ? OR (COALESCE(p.timestamp_epoch, 0) = ? AND p.id < ?))",
    );
    params.push(
      options.after.timestampEpoch,
      options.after.timestampEpoch,
      options.after.id,
    );
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  // Use literal LIMIT for compatibility with some MySQL servers and prepared statements.
  const query = `SELECT p.*, a.profile_picture_url FROM feed_instagram_posts p LEFT JOIN feed_instagram_accounts a ON a.username = p.account_username ${whereSql} ORDER BY COALESCE(p.timestamp_epoch, 0) DESC, p.id DESC LIMIT ${limit + 1}`;

  const rows = (await dbreq(query, params)) as FeedDbPostRow[];
  const hasMore = rows.length > limit;
  const posts = hasMore ? rows.slice(0, limit) : rows;

  let mediaItems: FeedDbMediaRow[] = [];
  if (posts.length > 0) {
    const postIds = posts.map((post) => post.id);
    const mediaQuery = `SELECT * FROM feed_instagram_media WHERE post_id IN (${buildInPlaceholders(postIds)}) ORDER BY post_id ASC, position ASC`;
    mediaItems = (await dbreq(mediaQuery, postIds)) as FeedDbMediaRow[];
  }

  return { posts, mediaItems, hasMore };
}

export async function getFeedAccountsFromDb(
  filterUsernames?: string[],
): Promise<FeedInstagramAccount[]> {
  const params: Array<string | number> = [];
  let query =
    "SELECT username, profile_picture_url FROM feed_instagram_accounts";

  if (filterUsernames && filterUsernames.length > 0) {
    query += ` WHERE username IN (${buildInPlaceholders(filterUsernames)})`;
    params.push(...filterUsernames);
  }

  const rows = (await dbreq(query, params)) as Array<{
    username: string;
    profile_picture_url: string | null;
  }>;

  return rows.map((row) => ({
    username: row.username,
    profilePictureUrl: row.profile_picture_url ?? "",
  }));
}

// Cursor: A string that indicates where to continue fetching the feed for a given account. It can be a timestamp, an ID, or any opaque value that the Instagram API uses for pagination.
export async function getFeedAccountCursors(
  filterUsernames?: string[],
): Promise<Record<string, string | null>> {
  const params: Array<string | number> = [];
  let query =
    "SELECT username, next_cursor, has_more FROM feed_instagram_accounts";

  if (filterUsernames && filterUsernames.length > 0) {
    query += ` WHERE username IN (${buildInPlaceholders(filterUsernames)})`;
    params.push(...filterUsernames);
  }

  const rows = (await dbreq(query, params)) as Array<{
    username: string;
    next_cursor: string | null;
    has_more: number | null;
  }>;

  return rows.reduce<Record<string, string | null>>((acc, row) => {
    const hasMore = row.has_more !== 0;
    // When we have no cursor yet but has_more is true, treat it as initial fetch.
    acc[row.username] = hasMore ? (row.next_cursor ?? "") : null;
    return acc;
  }, {});
}

export async function updateFeedAccountCursors(
  nextCursors: Record<string, string | null>,
) {
  const entries = Object.entries(nextCursors);
  for (const [username, cursor] of entries) {
    await dbreq(
      "INSERT INTO feed_instagram_accounts (username, next_cursor, has_more, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE next_cursor = VALUES(next_cursor), has_more = VALUES(has_more), updated_at = CURRENT_TIMESTAMP",
      [username, cursor, cursor ? 1 : 0],
    );
  }
}

export async function getFeedMediaDriveInfoByIds(mediaIds: string[]) {
  if (mediaIds.length === 0) return new Map();

  const query = `SELECT id, drive_file_id, drive_mime_type, drive_md5 FROM feed_instagram_media WHERE id IN (${buildInPlaceholders(mediaIds)})`;
  const rows = (await dbreq(query, mediaIds)) as Array<{
    id: string;
    drive_file_id: string | null;
    drive_mime_type: string | null;
    drive_md5: string | null;
  }>;

  // Map media ID to its drive info (file ID, MIME type, MD5 hash)
  return rows.reduce(
    (acc, row) => {
      acc.set(row.id, {
        driveFileId: row.drive_file_id,
        driveMimeType: row.drive_mime_type,
        driveMd5: row.drive_md5,
      });
      return acc;
    },
    new Map<
      string,
      {
        driveFileId: string | null;
        driveMimeType: string | null;
        driveMd5: string | null;
      }
    >(),
  );
}

export async function getFeedMediaByDriveId(driveId: string) {
  const rows = (await dbreq(
    "SELECT * FROM feed_instagram_media WHERE drive_file_id = ? LIMIT 1",
    [driveId],
  )) as FeedDbMediaRow[];

  return rows.length > 0 ? rows[0] : null;
}
