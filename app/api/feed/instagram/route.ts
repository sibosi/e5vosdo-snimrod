// TODO: Review & refactor

import { NextResponse, type NextRequest } from "next/server";
import {
  FEED_IG_PAGE_SIZE,
  fetchFeedInstagramFeed,
  type CursorsMap,
  type FeedInstagramAccount,
  type FeedInstagramPost,
} from "@/lib/feedInstagram";
import {
  isFeedMediaDriveEnabled,
  shouldStoreFeedVideos,
  uploadFeedMediaToDrive,
} from "@/lib/feedInstagramStorage";
import {
  getFeedAccountCursors,
  getFeedMediaDriveInfoByIds,
  getFeedPostsPage,
  updateFeedAccountCursors,
  upsertFeedAccounts,
  upsertFeedMediaItems,
  upsertFeedPosts,
  type FeedDbMediaRow,
  type FeedDbPostRow,
  type FeedMediaRecord,
} from "@/db/feedInstagram";

const DB_CURSOR_KEY = "__db_after";

function decodeDbAfterToken(cursors?: CursorsMap) {
  const token = cursors?.[DB_CURSOR_KEY];
  if (!token) return null;
  const [timestampRaw, id] = token.split(":");
  const timestampEpoch = Number(timestampRaw);
  if (!Number.isFinite(timestampEpoch) || !id) return null;
  return { timestampEpoch, id };
}

function encodeDbAfterToken(post: FeedDbPostRow) {
  const timestampEpoch = post.timestamp_epoch ?? 0;
  return `${timestampEpoch}:${post.id}`;
}

function collectAccounts(posts: FeedInstagramPost[]): FeedInstagramAccount[] {
  const unique = new Map<string, FeedInstagramAccount>();
  for (const post of posts) {
    unique.set(post.account.username, post.account);
  }
  return Array.from(unique.values());
}

function buildMediaRecords(posts: FeedInstagramPost[]): FeedMediaRecord[] {
  const items: FeedMediaRecord[] = [];

  for (const post of posts) {
    if (post.mediaType === "CAROUSEL_ALBUM" && post.carouselItems.length > 0) {
      post.carouselItems.forEach((item, index) => {
        items.push({
          id: item.id,
          postId: post.id,
          mediaType: item.mediaType,
          displayUrl: item.displayUrl,
          position: index,
        });
      });
    } else {
      items.push({
        id: post.id,
        postId: post.id,
        mediaType: post.mediaType,
        displayUrl: post.displayUrl,
        position: 0,
      });
    }
  }

  return items;
}

function mapMediaToPosts(posts: FeedDbPostRow[], mediaItems: FeedDbMediaRow[]) {
  const mediaByPost = new Map<string, FeedDbMediaRow[]>();
  for (const media of mediaItems) {
    const list = mediaByPost.get(media.post_id) ?? [];
    list.push(media);
    mediaByPost.set(media.post_id, list);
  }

  return { mediaByPost };
}

function resolveMediaUrl(
  displayUrl: string | null,
  driveFileId: string | null,
) {
  if (isFeedMediaDriveEnabled() && driveFileId) {
    return `/api/feed/instagram/media/${driveFileId}`;
  }
  return displayUrl ?? "";
}

async function fetchAndStoreFromMeta(filterUsernames?: string[]) {
  const cursorsFromDb = await getFeedAccountCursors(filterUsernames);
  const { posts, nextCursors } = await fetchFeedInstagramFeed(
    cursorsFromDb,
    filterUsernames,
  );

  if (posts.length > 0) {
    const accounts = collectAccounts(posts);
    await upsertFeedAccounts(accounts);
    await upsertFeedPosts(posts);

    const mediaRecords = buildMediaRecords(posts);
    const existingMedia = await getFeedMediaDriveInfoByIds(
      mediaRecords.map((record) => record.id),
    );

    if (isFeedMediaDriveEnabled()) {
      const allowVideos = shouldStoreFeedVideos();
      for (const record of mediaRecords) {
        const existing = existingMedia.get(record.id);
        if (existing?.driveFileId) {
          continue;
        }
        if (record.mediaType === "VIDEO" && !allowVideos) {
          continue;
        }

        try {
          const driveInfo = await uploadFeedMediaToDrive({
            mediaUrl: record.displayUrl,
            fileNameBase: record.id,
          });
          record.driveFileId = driveInfo.driveFileId;
          record.driveMimeType = driveInfo.driveMimeType;
          record.driveMd5 = driveInfo.driveMd5;
        } catch (error) {
          console.warn("Failed to upload feed media", record.id, error);
        }
      }
    }

    await upsertFeedMediaItems(mediaRecords);
  }

  const usernamesWithPosts = new Set(
    posts.map((post) => post.account.username),
  );
  const nextCursorsToUpdate: CursorsMap = {};
  for (const [username, nextCursor] of Object.entries(nextCursors)) {
    const previousCursor = cursorsFromDb[username];
    if (usernamesWithPosts.has(username) || previousCursor === null) {
      nextCursorsToUpdate[username] = nextCursor ?? null;
    }
  }

  if (Object.keys(nextCursorsToUpdate).length > 0) {
    await updateFeedAccountCursors(nextCursorsToUpdate);
  }
}

export async function GET(request: NextRequest) {
  try {
    const cursorsParam = request.nextUrl.searchParams.get("cursors");
    const usernamesParam = request.nextUrl.searchParams.get("usernames");
    const filterUsernames = usernamesParam
      ? usernamesParam
          .split(",")
          .map((u) => u.trim())
          .filter(Boolean)
      : undefined;
    const cursors: CursorsMap | undefined = cursorsParam
      ? (JSON.parse(cursorsParam) as CursorsMap)
      : undefined;
    const dbAfter = decodeDbAfterToken(cursors ?? undefined);

    let page = await getFeedPostsPage({
      filterUsernames,
      after: dbAfter,
      limit: FEED_IG_PAGE_SIZE,
    });

    let accountCursors = await getFeedAccountCursors(filterUsernames);
    let hasMoreMeta = Object.values(accountCursors).some(
      (cursor) => cursor !== null,
    );

    const shouldBackfill =
      page.posts.length < FEED_IG_PAGE_SIZE &&
      (hasMoreMeta || Object.keys(accountCursors).length === 0);

    if (shouldBackfill) {
      try {
        await fetchAndStoreFromMeta(filterUsernames);
      } catch (error) {
        console.warn("Feed backfill failed", error);
      }

      page = await getFeedPostsPage({
        filterUsernames,
        after: dbAfter,
        limit: FEED_IG_PAGE_SIZE,
      });

      accountCursors = await getFeedAccountCursors(filterUsernames);
      hasMoreMeta = Object.values(accountCursors).some(
        (cursor) => cursor !== null,
      );
    }

    const { mediaByPost } = mapMediaToPosts(page.posts, page.mediaItems);

    const posts = page.posts.map((post) => {
      const mediaItems = mediaByPost.get(post.id) ?? [];
      const resolvedMedia = mediaItems.map((media) => ({
        id: media.id,
        mediaType: media.media_type,
        displayUrl: resolveMediaUrl(media.display_url, media.drive_file_id),
      }));
      const displayUrl = resolveMediaUrl(
        mediaItems[0]?.display_url ?? post.display_url,
        mediaItems[0]?.drive_file_id ?? null,
      );

      return {
        id: post.id,
        caption: post.caption ?? "",
        mediaType: post.media_type,
        displayUrl,
        account: {
          username: post.account_username,
          profilePictureUrl: post.profile_picture_url ?? "",
        },
        permalink: post.permalink ?? "",
        timestamp: post.timestamp ?? "",
        likeCount: post.like_count ?? 0,
        commentsCount: post.comments_count ?? 0,
        carouselItems:
          post.media_type === "CAROUSEL_ALBUM" ? resolvedMedia : [],
      } satisfies FeedInstagramPost;
    });

    const hasMore = posts.length > 0 && (page.hasMore || hasMoreMeta);
    const nextCursors =
      hasMore && page.posts.length > 0
        ? ({
            [DB_CURSOR_KEY]: encodeDbAfterToken(page.posts.at(-1)!),
          } as CursorsMap)
        : undefined;

    const account = posts[0]?.account ?? {
      username: "instagram",
      profilePictureUrl: "",
    };

    return NextResponse.json({
      account,
      posts,
      nextCursors,
      hasMore,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to fetch feed Instagram posts:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error while reading Instagram feed";

    return NextResponse.json(
      { error: "Failed to load Instagram feed", details: message },
      { status: 500 },
    );
  }
}
