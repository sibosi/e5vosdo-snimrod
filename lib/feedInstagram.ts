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

type OwnMediaResponse = {
  data?: GraphMediaPost[];
  paging?: {
    cursors?: { before?: string; after?: string };
    next?: string;
  };
  error?: { message?: string };
};

type OwnProfileResponse = {
  username?: string;
  profile_picture_url?: string;
  id?: string;
  error?: { message?: string };
};

export type FeedInstagramMedia = {
  id: string;
  mediaType: string;
  displayUrl: string;
};

export type FeedInstagramPost = {
  id: string;
  caption: string;
  mediaType: string;
  displayUrl: string;
  account: FeedInstagramAccount;
  permalink: string;
  timestamp: string;
  likeCount: number;
  commentsCount: number;
  carouselItems: FeedInstagramMedia[];
};

export type FeedInstagramAccount = {
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

  const ownUsername =
    (process.env.META_IG_OWN_USERNAME ?? "").trim() || undefined;

  if (!accountId || !accessToken || usernames.length === 0) {
    throw new Error(
      "Missing required Meta API env vars: META_IG_ACCOUNT_ID, META_IG_ACCESS_TOKEN, META_IG_USERNAMES_TO_TRACK",
    );
  }

  return { accountId, accessToken, graphVersion, usernames, ownUsername };
}

function normalizePost(
  item: GraphMediaPost,
  account: FeedInstagramAccount,
): FeedInstagramPost | null {
  const displayUrl = item.media_url ?? item.thumbnail_url ?? "";
  if (!displayUrl) return null;

  const carouselItems: FeedInstagramMedia[] =
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
          .filter((child): child is FeedInstagramMedia => child !== null)
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
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

type CacheEntry = {
  timestamp: number;
  account: FeedInstagramAccount;
  posts: FeedInstagramPost[];
  nextCursors: CursorsMap;
  hasMore: boolean;
};

type AccountsCacheEntry = {
  timestamp: number;
  accounts: FeedInstagramAccount[];
};

const globalCache = globalThis as typeof globalThis & {
  __feedIgCache?: Map<string, CacheEntry>;
  __feedIgAccountsCache?: AccountsCacheEntry;
};

function getCache(): Map<string, CacheEntry> {
  globalCache.__feedIgCache ??= new Map();
  return globalCache.__feedIgCache;
}

function getCacheKey(cursors?: CursorsMap, filterUsernames?: string[]): string {
  const prefix = filterUsernames
    ? filterUsernames.toSorted((a, b) => a.localeCompare(b)).join("+")
    : "__mixed__";
  if (!cursors) return `${prefix}:__initial__`;
  return `${prefix}:${JSON.stringify(
    Object.keys(cursors)
      .sort((a, b) => a.localeCompare(b))
      .map((k) => [k, cursors[k]]),
  )}`;
}

async function fetchBusinessDiscovery(
  accountId: string,
  targetUsername: string,
  accessToken: string,
  graphVersion: string,
  afterCursor?: string,
): Promise<{
  account: FeedInstagramAccount;
  posts: FeedInstagramPost[];
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

  const account: FeedInstagramAccount = {
    username: discovery.username ?? targetUsername,
    profilePictureUrl: discovery.profile_picture_url ?? "",
  };

  const posts = (discovery.media?.data ?? [])
    .map((item) => normalizePost(item, account))
    .filter((item): item is FeedInstagramPost => item !== null);

  const nextCursor = discovery.media?.paging?.cursors?.after ?? null;

  return { account, posts, nextCursor };
}

async function fetchOwnAccountMedia(
  accountId: string,
  accessToken: string,
  graphVersion: string,
  ownUsername: string,
  afterCursor?: string,
): Promise<{
  account: FeedInstagramAccount;
  posts: FeedInstagramPost[];
  nextCursor: string | null;
}> {
  // Fetch profile info
  const profileUrl = new URL(
    `https://graph.facebook.com/${graphVersion}/${accountId}`,
  );
  profileUrl.searchParams.set("fields", "username,profile_picture_url");
  profileUrl.searchParams.set("access_token", accessToken);

  const profileRes = await fetch(profileUrl.toString(), {
    method: "GET",
    cache: "no-store",
  });
  const profileData = (await profileRes.json()) as OwnProfileResponse;

  const account: FeedInstagramAccount = {
    username: profileData.username ?? ownUsername,
    profilePictureUrl: profileData.profile_picture_url ?? "",
  };

  // Fetch media
  const mediaUrl = new URL(
    `https://graph.facebook.com/${graphVersion}/${accountId}/media`,
  );
  mediaUrl.searchParams.set(
    "fields",
    "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count,children{id,media_type,media_url,thumbnail_url}",
  );
  mediaUrl.searchParams.set("limit", String(PAGE_SIZE));
  mediaUrl.searchParams.set("access_token", accessToken);
  if (afterCursor) mediaUrl.searchParams.set("after", afterCursor);

  const mediaRes = await fetch(mediaUrl.toString(), {
    method: "GET",
    cache: "no-store",
  });
  const mediaData = (await mediaRes.json()) as OwnMediaResponse;

  if (!mediaRes.ok) {
    throw new Error(
      mediaData.error?.message ?? "Own account media request failed",
    );
  }

  const posts = (mediaData.data ?? [])
    .map((item) => normalizePost(item, account))
    .filter((item): item is FeedInstagramPost => item !== null);

  const nextCursor = mediaData.paging?.cursors?.after ?? null;

  return { account, posts, nextCursor };
}

function getTimestampValue(timestamp: string) {
  if (!timestamp) return 0;
  const parsed = Date.parse(timestamp);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export type CursorsMap = Record<string, string | null>;

async function fetchAccountProfile(
  username: string,
  accountId: string,
  accessToken: string,
  graphVersion: string,
  ownUsername?: string,
): Promise<FeedInstagramAccount | null> {
  if (ownUsername && username === ownUsername) {
    const profileUrl = new URL(
      `https://graph.facebook.com/${graphVersion}/${accountId}`,
    );
    profileUrl.searchParams.set("fields", "username,profile_picture_url");
    profileUrl.searchParams.set("access_token", accessToken);

    const response = await fetch(profileUrl.toString(), {
      method: "GET",
      cache: "no-store",
    });
    const profileData = (await response.json()) as OwnProfileResponse;

    if (!response.ok) return null;
    return {
      username: profileData.username ?? username,
      profilePictureUrl: profileData.profile_picture_url ?? "",
    };
  }

  const fields = `business_discovery.username(${username}){username,profile_picture_url}`;
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

  if (!response.ok || !payload.business_discovery) return null;
  return {
    username: payload.business_discovery.username ?? username,
    profilePictureUrl: payload.business_discovery.profile_picture_url ?? "",
  };
}

export async function fetchFeedAccounts(): Promise<FeedInstagramAccount[]> {
  const cached = globalCache.__feedIgAccountsCache;
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.accounts;
  }

  const { accountId, accessToken, graphVersion, usernames, ownUsername } =
    getMetaConfig();
  const accounts: FeedInstagramAccount[] = [];

  for (const username of usernames) {
    try {
      const account = await fetchAccountProfile(
        username,
        accountId,
        accessToken,
        graphVersion,
        ownUsername,
      );
      if (account) accounts.push(account);
    } catch (error) {
      console.warn(`Failed to fetch account info for @${username}`, error);
    }
  }

  globalCache.__feedIgAccountsCache = {
    timestamp: Date.now(),
    accounts,
  };

  return accounts;
}

export async function fetchFeedInstagramFeed(
  cursors?: CursorsMap,
  filterUsernames?: string[],
): Promise<{
  account: FeedInstagramAccount;
  posts: FeedInstagramPost[];
  nextCursors: CursorsMap;
  hasMore: boolean;
}> {
  const cache = getCache();
  const cacheKey = getCacheKey(cursors, filterUsernames);
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return {
      account: cached.account,
      posts: cached.posts,
      nextCursors: cached.nextCursors,
      hasMore: cached.hasMore,
    };
  }

  const { accountId, accessToken, graphVersion, usernames, ownUsername } =
    getMetaConfig();
  const targetUsernames = filterUsernames
    ? usernames.filter((u) => filterUsernames.includes(u))
    : usernames;

  const posts: FeedInstagramPost[] = [];
  const accounts: FeedInstagramAccount[] = [];
  const nextCursors: CursorsMap = {};

  for (const username of targetUsernames) {
    const cursor = cursors?.[username];
    if (cursor === null) {
      // This account has no more pages
      nextCursors[username] = null;
      continue;
    }

    try {
      const isOwnAccount = ownUsername && username === ownUsername;
      const {
        account,
        posts: accountPosts,
        nextCursor,
      } = isOwnAccount
        ? await fetchOwnAccountMedia(
            accountId,
            accessToken,
            graphVersion,
            ownUsername,
            cursor,
          )
        : await fetchBusinessDiscovery(
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
