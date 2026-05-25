import { NextResponse, type NextRequest } from "next/server";
import { FEED_IG_PAGE_SIZE, type FeedInstagramPost } from "@/lib/feedInstagram";
import { isFeedMediaDriveEnabled } from "@/lib/feedInstagramStorage";
import {
  getFeedPostsPage,
  type FeedDbMediaRow,
  type FeedDbPostRow,
} from "@/db/feedInstagram";

function decodeAfterToken(after?: string | null) {
  if (!after) return null;
  const [timestampRaw, id] = after.split(":");
  const timestampEpoch = Number(timestampRaw);
  if (!Number.isFinite(timestampEpoch) || !id) return null;
  return { timestampEpoch, id };
}

function encodeAfterToken(post: FeedDbPostRow) {
  const timestampEpoch = post.timestamp_epoch ?? 0;
  return `${timestampEpoch}:${post.id}`;
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

export async function GET(request: NextRequest) {
  try {
    const afterParam = request.nextUrl.searchParams.get("after");
    const usernamesParam = request.nextUrl.searchParams.get("usernames");
    const filterUsernames = usernamesParam
      ? usernamesParam
          .split(",")
          .map((u) => u.trim())
          .filter(Boolean)
      : undefined;
    const dbAfter = decodeAfterToken(afterParam);

    const page = await getFeedPostsPage({
      filterUsernames,
      after: dbAfter,
      limit: FEED_IG_PAGE_SIZE,
    });

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

    const hasMore = posts.length > 0 && page.hasMore;
    const nextAfter =
      hasMore && page.posts.length > 0
        ? encodeAfterToken(page.posts.at(-1)!)
        : undefined;

    const account = posts[0]?.account ?? {
      username: "instagram",
      profilePictureUrl: "",
    };

    return NextResponse.json({
      account,
      posts,
      nextAfter,
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
