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
  children?: {
    data?: GraphMediaChild[];
  };
};

type BusinessDiscoveryResponse = {
  business_discovery?: {
    username?: string;
    profile_picture_url?: string;
    followers_count?: number;
    media_count?: number;
    media?: {
      data?: GraphMediaPost[];
      paging?: {
        cursors?: { before?: string; after?: string };
        next?: string;
      };
    };
  };
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
  carouselItems: ElectionsInstagramMedia[];
};

export type ElectionsInstagramAccount = {
  username: string;
  profilePictureUrl: string;
};

function getMetaConfig() {
  const accountId = process.env.META_IG_ACCOUNT_ID;
  const accessToken = process.env.META_IG_ACCESS_TOKEN;
  const graphVersion = process.env.META_GRAPH_VERSION ?? "v25.0";
  const usernames = Array.from(
    new Set(
      (process.env.META_IG_USERNAMES_TO_TRACK ?? "")
        .split(/[\s,;]+/)
        .map((value) => value.trim())
        .filter((value) => value.length > 0),
    ),
  );

  if (!accountId || !accessToken || usernames.length === 0) {
    throw new Error(
      "Missing required Meta API env vars: META_IG_ACCOUNT_ID, META_IG_ACCESS_TOKEN, META_IG_USERNAMES_TO_TRACK",
    );
  }

  return { accountId, accessToken, graphVersion, usernames };
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
    carouselItems,
  };
}

const PAGE_SIZE = 5;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

type CacheEntry = {
  timestamp: number;
  account: ElectionsInstagramAccount;
  posts: ElectionsInstagramPost[];
  nextCursors: CursorsMap;
  hasMore: boolean;
};

const globalCache = globalThis as typeof globalThis & {
  __electionsIgCache?: Map<string, CacheEntry>;
};

function getCache(): Map<string, CacheEntry> {
  globalCache.__electionsIgCache ??= new Map();
  return globalCache.__electionsIgCache;
}

function getCacheKey(cursors?: CursorsMap): string {
  if (!cursors) return "__initial__";
  return JSON.stringify(
    Object.keys(cursors)
      .sort((a, b) => a.localeCompare(b))
      .map((k) => [k, cursors[k]]),
  );
}

async function fetchBusinessDiscovery(
  accountId: string,
  targetUsername: string,
  accessToken: string,
  graphVersion: string,
  afterCursor?: string,
): Promise<{
  account: ElectionsInstagramAccount;
  posts: ElectionsInstagramPost[];
  nextCursor: string | null;
}> {
  const mediaField = afterCursor
    ? `media.limit(${PAGE_SIZE}).after(${afterCursor})`
    : `media.limit(${PAGE_SIZE})`;

  const fields =
    `business_discovery.username(${targetUsername}){` +
    "username,profile_picture_url," +
    `${mediaField}{` +
    "id,caption,media_type,media_url,thumbnail_url," +
    "permalink,timestamp,like_count,comments_count," +
    "children{id,media_type,media_url,thumbnail_url}" +
    "}" +
    "}";

  const url = new URL(
    `https://graph.facebook.com/${graphVersion}/${accountId}`,
  );
  url.searchParams.set("fields", fields);
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
  });

  const payload = (await response.json()) as BusinessDiscoveryResponse;

  if (!response.ok) {
    throw new Error(
      payload.error?.message ?? "Business Discovery API request failed",
    );
  }

  const discovery = payload.business_discovery;
  if (!discovery) {
    throw new Error(
      `No business_discovery data returned for @${targetUsername}`,
    );
  }

  const account: ElectionsInstagramAccount = {
    username: discovery.username ?? targetUsername,
    profilePictureUrl: discovery.profile_picture_url ?? "",
  };

  const posts = (discovery.media?.data ?? [])
    .map((item) => normalizePost(item, account))
    .filter((item): item is ElectionsInstagramPost => item !== null);

  const nextCursor = discovery.media?.paging?.cursors?.after ?? null;

  return { account, posts, nextCursor };
}

function getTimestampValue(timestamp: string) {
  if (!timestamp) return 0;
  const parsed = Date.parse(timestamp);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export type CursorsMap = Record<string, string | null>;

export async function fetchElectionsInstagramFeed(
  cursors?: CursorsMap,
): Promise<{
  account: ElectionsInstagramAccount;
  posts: ElectionsInstagramPost[];
  nextCursors: CursorsMap;
  hasMore: boolean;
}> {
  const cache = getCache();
  const cacheKey = getCacheKey(cursors);
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return {
      account: cached.account,
      posts: cached.posts,
      nextCursors: cached.nextCursors,
      hasMore: cached.hasMore,
    };
  }

  const { accountId, accessToken, graphVersion, usernames } = getMetaConfig();

  const posts: ElectionsInstagramPost[] = [];
  const accounts: ElectionsInstagramAccount[] = [];
  const nextCursors: CursorsMap = {};

  for (const username of usernames) {
    const cursor = cursors?.[username];
    if (cursor === null) {
      // This account has no more pages
      nextCursors[username] = null;
      continue;
    }

    try {
      const {
        account,
        posts: accountPosts,
        nextCursor,
      } = await fetchBusinessDiscovery(
        accountId,
        username,
        accessToken,
        graphVersion,
        cursor,
      );
      accounts.push(account);
      posts.push(...accountPosts);
      nextCursors[username] = nextCursor;
    } catch (error) {
      console.warn(`Failed to fetch Instagram data for @${username}`, error);
      nextCursors[username] = null;
    }
  }

  if (accounts.length === 0 && !cursors) {
    throw new Error(
      "Failed to load Instagram data for all configured usernames",
    );
  }

  posts.sort(
    (left, right) =>
      getTimestampValue(right.timestamp) - getTimestampValue(left.timestamp),
  );

  const account = accounts[0] ?? {
    username: "instagram",
    profilePictureUrl: "",
  };
  const hasMore = Object.values(nextCursors).some((c) => c !== null);

  cache.set(cacheKey, {
    timestamp: Date.now(),
    account,
    posts,
    nextCursors,
    hasMore,
  });

  return { account, posts, nextCursors, hasMore };
}
