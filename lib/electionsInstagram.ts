type GraphMediaChild = {
  id: string;
  media_type: string;
  media_url?: string;
  thumbnail_url?: string;
};

type GraphMediaPost = {
  id: string;
  caption?: string;
  media_type: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
  like_count?: number;
  comments_count?: number;
  comments?: {
    data?: Array<{
      id: string;
      text?: string;
      username?: string;
      timestamp?: string;
    }>;
  };
  children?: {
    data?: GraphMediaChild[];
  };
};

type GraphApiResponse = {
  data?: GraphMediaPost[];
  error?: {
    message?: string;
  };
};

type GraphAccountResponse = {
  username?: string;
  profile_picture_url?: string;
  error?: {
    message?: string;
  };
};

type GraphCommentsResponse = {
  data?: Array<{
    id: string;
    text?: string;
    username?: string;
    timestamp?: string;
  }>;
  error?: {
    message?: string;
  };
};

export type ElectionsInstagramMedia = {
  id: string;
  mediaType: string;
  displayUrl: string;
};

export type ElectionsInstagramPost = {
  id: string;
  caption: string;
  mediaType: string;
  displayUrl: string;
  account: ElectionsInstagramAccount;
  permalink: string;
  timestamp: string;
  likeCount: number;
  commentsCount: number;
  comments: Array<{
    id: string;
    text: string;
    username: string;
    timestamp: string;
  }>;
  carouselItems: ElectionsInstagramMedia[];
};

export type ElectionsInstagramAccount = {
  username: string;
  profilePictureUrl: string;
};

const CACHE_DURATION_MS = 20 * 1000 * 0; // 20 seconds

const globalCache = globalThis as typeof globalThis & {
  __electionsInstagramFeedCache?: {
    timestamp: number;
    accountIdsKey: string;
    account: ElectionsInstagramAccount;
    posts: ElectionsInstagramPost[];
  };
};

function getMetaConfig() {
  const accountIdRaw = process.env.META_IG_ACCOUNT_ID;
  const accessToken = process.env.META_IG_ACCESS_TOKEN;
  const graphVersion = process.env.META_GRAPH_VERSION ?? "v25.0";
  const accountIds = Array.from(
    new Set(
      (accountIdRaw ?? "")
        .split(/[\s,;]+/)
        .map((value) => value.trim())
        .filter((value) => value.length > 0),
    ),
  );

  if (accountIds.length === 0 || !accessToken) {
    throw new Error(
      "Missing required Meta API env vars: META_IG_ACCOUNT_ID, META_IG_ACCESS_TOKEN",
    );
  }

  return { accountIds, accessToken, graphVersion };
}

function normalizePost(
  item: GraphMediaPost,
  account: ElectionsInstagramAccount,
): ElectionsInstagramPost | null {
  const displayUrl = item.media_url ?? item.thumbnail_url ?? "";
  if (!displayUrl) return null;

  const carouselItems: ElectionsInstagramMedia[] =
    item.media_type === "CAROUSEL_ALBUM"
      ? (item.children?.data ?? [])
          .map((child) => {
            const childDisplayUrl = child.media_url ?? child.thumbnail_url;
            if (!childDisplayUrl) return null;

            return {
              id: child.id,
              mediaType: child.media_type,
              displayUrl: childDisplayUrl,
            };
          })
          .filter((child): child is ElectionsInstagramMedia => child !== null)
      : [];

  return {
    id: item.id,
    caption: item.caption ?? "",
    mediaType: item.media_type,
    displayUrl,
    account,
    permalink: item.permalink ?? "",
    timestamp: item.timestamp ?? "",
    likeCount: item.like_count ?? 0,
    commentsCount: item.comments_count ?? 0,
    comments: (item.comments?.data ?? []).map((comment) => ({
      id: comment.id,
      text: comment.text ?? "",
      username: comment.username ?? "•",
      timestamp: comment.timestamp ?? "",
    })),
    carouselItems,
  };
}

async function fetchPostComments(
  postId: string,
  accessToken: string,
  graphVersion: string,
) {
  const commentsUrl = new URL(
    `https://graph.facebook.com/${graphVersion}/${postId}/comments`,
  );
  commentsUrl.searchParams.set("access_token", accessToken);
  commentsUrl.searchParams.set("fields", "id,text,username,timestamp");
  commentsUrl.searchParams.set("limit", "10");

  const response = await fetch(commentsUrl.toString(), {
    method: "GET",
    cache: "no-store",
  });

  const payload = (await response.json()) as GraphCommentsResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message ?? "Failed to load comments");
  }

  return (payload.data ?? []).map((comment) => ({
    id: comment.id,
    text: comment.text ?? "",
    username: comment.username ?? "•",
    timestamp: comment.timestamp ?? "",
  }));
}

async function fetchAccount(
  accountId: string,
  accessToken: string,
  graphVersion: string,
): Promise<ElectionsInstagramAccount> {
  const accountUrl = new URL(
    `https://graph.facebook.com/${graphVersion}/${accountId}`,
  );
  accountUrl.searchParams.set("access_token", accessToken);
  accountUrl.searchParams.set("fields", "username,profile_picture_url");

  const response = await fetch(accountUrl.toString(), {
    method: "GET",
    cache: "no-store",
  });

  const payload = (await response.json()) as GraphAccountResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message ?? "Failed to load IG account info");
  }

  return {
    username: payload.username ?? "instagram",
    profilePictureUrl: payload.profile_picture_url ?? "",
  };
}

async function fetchPostsForAccount(
  accountId: string,
  account: ElectionsInstagramAccount,
  accessToken: string,
  graphVersion: string,
): Promise<ElectionsInstagramPost[]> {
  const firstUrl = new URL(
    `https://graph.facebook.com/${graphVersion}/${accountId}/media`,
  );

  firstUrl.searchParams.set("access_token", accessToken);
  firstUrl.searchParams.set(
    "fields",
    "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count,comments.limit(3){id,text,username,timestamp},children{id,media_type,media_url,thumbnail_url}",
  );

  const posts: ElectionsInstagramPost[] = [];
  let nextUrl: string | null = firstUrl.toString();

  while (nextUrl) {
    const response = await fetch(nextUrl, {
      method: "GET",
      cache: "no-store",
    });

    const payload = (await response.json()) as
      | (GraphApiResponse & { paging?: { next?: string } })
      | GraphApiResponse;

    if (!response.ok) {
      throw new Error(payload.error?.message ?? "Meta Graph API request failed");
    }

    posts.push(
      ...(payload.data ?? [])
        .map((item) => normalizePost(item, account))
        .filter((item): item is ElectionsInstagramPost => item !== null),
    );

    nextUrl = "paging" in payload ? (payload.paging?.next ?? null) : null;
  }

  return posts;
}

function getTimestampValue(timestamp: string) {
  if (!timestamp) return 0;
  const parsed = Date.parse(timestamp);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export async function fetchElectionsInstagramFeed(): Promise<{
  account: ElectionsInstagramAccount;
  posts: ElectionsInstagramPost[];
}> {
  const now = Date.now();
  const cache = globalCache.__electionsInstagramFeedCache;
  const { accountIds, accessToken, graphVersion } = getMetaConfig();
  const accountIdsKey = accountIds.join(",");

  if (
    cache?.accountIdsKey === accountIdsKey &&
    now - cache.timestamp < CACHE_DURATION_MS
  ) {
    return { account: cache.account, posts: cache.posts };
  }

  const posts: ElectionsInstagramPost[] = [];
  const accounts: ElectionsInstagramAccount[] = [];

  for (const accountId of accountIds) {
    try {
      const account = await fetchAccount(accountId, accessToken, graphVersion);
      accounts.push(account);
      const accountPosts = await fetchPostsForAccount(
        accountId,
        account,
        accessToken,
        graphVersion,
      );
      posts.push(...accountPosts);
    } catch (error) {
      console.warn(`Failed to fetch Instagram data for account ${accountId}`, error);
    }
  }

  if (accounts.length === 0) {
    throw new Error("Failed to load Instagram data for all configured account IDs");
  }

  for (let index = 0; index < posts.length; index += 1) {
    const post = posts[index];
    const hasNamedComments = post.comments.some(
      (comment) => !!comment.username && comment.username !== "•",
    );
    if (hasNamedComments || post.commentsCount === 0) continue;

    try {
      const comments = await fetchPostComments(
        post.id,
        accessToken,
        graphVersion,
      );
      if (comments.length > 0) {
        posts[index] = {
          ...post,
          comments,
        };
      }
    } catch (error) {
      console.warn(`Failed to enrich comments for post ${post.id}`, error);
    }
  }

  posts.sort(
    (left, right) => getTimestampValue(right.timestamp) - getTimestampValue(left.timestamp),
  );

  const account = accounts[0];

  globalCache.__electionsInstagramFeedCache = {
    timestamp: now,
    accountIdsKey,
    account,
    posts,
  };

  return { account, posts };
}

export async function fetchElectionsInstagramPosts(): Promise<
  ElectionsInstagramPost[]
> {
  const { posts } = await fetchElectionsInstagramFeed();
  return posts;
}
