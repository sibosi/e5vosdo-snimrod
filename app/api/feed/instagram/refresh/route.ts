import { NextResponse, type NextRequest } from "next/server";
import { getAuth } from "@/db/dbreq";
import { hasPermission } from "@/db/permissions";
import {
  fetchFeedInstagramAccountIdPage,
  fetchFeedInstagramAccountPage,
  getFeedInstagramUsernames,
  type FeedInstagramPost,
} from "@/lib/feedInstagram";
import {
  getFeedMediaDriveInfoByIds,
  getFeedPostIdsByIds,
  upsertFeedAccounts,
  upsertFeedMediaItems,
  upsertFeedPosts,
  type FeedMediaRecord,
} from "@/db/feedInstagram";
import {
  isFeedMediaDriveEnabled,
  shouldStoreFeedVideos,
  uploadFeedMediaToDrive,
} from "@/lib/feedInstagramStorage";

const REFRESH_PAGE_LIMIT = 5;
const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);

function isLocalRequest(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  const ipCandidates: string[] = [];
  if (forwardedFor) {
    forwardedFor
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .forEach((entry) => ipCandidates.push(entry));
  }
  if (realIp) {
    ipCandidates.push(realIp.trim());
  }

  if (ipCandidates.some((ip) => LOCAL_HOSTS.has(ip))) {
    return true;
  }

  const hostHeader = request.headers.get("host");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const hostCandidates = [request.nextUrl.hostname, hostHeader, forwardedHost]
    .filter(Boolean)
    .map((host) => (host ?? "").split(":")[0]);

  return hostCandidates.some((host) => LOCAL_HOSTS.has(host));
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

async function upsertFeedData(posts: FeedInstagramPost[]) {
  if (posts.length === 0) return;

  const accounts = new Map<
    string,
    { username: string; profilePictureUrl: string }
  >();
  for (const post of posts) {
    accounts.set(post.account.username, post.account);
  }

  await upsertFeedAccounts(Array.from(accounts.values()));
  await upsertFeedPosts(posts);

  const mediaRecords = buildMediaRecords(posts);
  if (isFeedMediaDriveEnabled()) {
    const existingMedia = await getFeedMediaDriveInfoByIds(
      mediaRecords.map((record) => record.id),
    );
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

export async function GET(request: NextRequest) {
  try {
    const selfUser = await getAuth();
    const isAdmin = hasPermission(selfUser, "admin");
    const isLocal = isLocalRequest(request);

    if (!isAdmin && !isLocal) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const usernamesParam = request.nextUrl.searchParams.get("usernames");
    const filterUsernames = usernamesParam
      ? usernamesParam
          .split(",")
          .map((username) => username.trim())
          .filter(Boolean)
      : undefined;

    const targetUsernames = getFeedInstagramUsernames(filterUsernames);
    if (targetUsernames.length === 0) {
      return NextResponse.json(
        { error: "No tracked Instagram usernames matched the request" },
        { status: 400 },
      );
    }

    const results: Array<{
      username: string;
      pagesFetched: number;
      fetchedPosts: number;
      newPosts: number;
      stoppedByDuplicate: boolean;
      error?: string;
    }> = [];

    for (const username of targetUsernames) {
      let afterCursor: string | null | undefined = undefined;
      let stoppedByDuplicate = false;
      let pagesFetched = 0;
      let fetchedPosts = 0;
      let newPosts = 0;

      console.info(`Feed refresh: ${username} start`);

      try {
        while (true) {
          const idPage = await fetchFeedInstagramAccountIdPage({
            username,
            afterCursor,
            limit: REFRESH_PAGE_LIMIT,
          });

          pagesFetched += 1;

          if (idPage.postIds.length === 0) {
            break;
          }

          const existingIds = await getFeedPostIdsByIds(idPage.postIds);
          const hasDuplicate = existingIds.size > 0;
          const newPostsCount = idPage.postIds.reduce(
            (count, postId) => count + (existingIds.has(postId) ? 0 : 1),
            0,
          );

          if (hasDuplicate) {
            stoppedByDuplicate = true;
          }

          fetchedPosts += idPage.postIds.length;
          newPosts += newPostsCount;

          if (newPostsCount > 0) {
            const page = await fetchFeedInstagramAccountPage({
              username,
              afterCursor,
              limit: REFRESH_PAGE_LIMIT,
            });

            if (page.posts.length === 0) {
              break;
            }

            await upsertFeedData(page.posts);

            afterCursor = page.nextCursor;
          } else {
            afterCursor = idPage.nextCursor;
          }

          if (hasDuplicate) {
            break;
          }

          if (!afterCursor) {
            break;
          }
        }

        console.info(
          `Feed refresh: ${username} done pages=${pagesFetched} new=${newPosts}`,
        );

        results.push({
          username,
          pagesFetched,
          fetchedPosts,
          newPosts,
          stoppedByDuplicate,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`Feed refresh failed for @${username}`, error);
        results.push({
          username,
          pagesFetched,
          fetchedPosts,
          newPosts,
          stoppedByDuplicate,
          error: message,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      results,
      refreshedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Feed refresh failed", error);
    const message =
      error instanceof Error ? error.message : "Unknown feed refresh error";

    return NextResponse.json(
      { error: "Failed to refresh Instagram feed", details: message },
      { status: 500 },
    );
  }
}
