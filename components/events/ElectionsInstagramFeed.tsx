"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { HeartFilledIcon, InstagramIcon } from "@/components/icons";
import type {
  ElectionsInstagramPost,
  CursorsMap,
} from "@/lib/electionsInstagram";
import { Chip } from "@heroui/react";

type FeedResponse = {
  posts?: ElectionsInstagramPost[];
  nextCursors?: CursorsMap;
  hasMore?: boolean;
  error?: string;
  details?: string;
};

function formatTimestamp(timestamp: string) {
  if (!timestamp) return "";

  try {
    return new Intl.DateTimeFormat("hu-HU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  } catch {
    return timestamp;
  }
}

function MediaItem({
  url,
  mediaType,
  alt,
}: Readonly<{
  url: string;
  mediaType: string;
  alt: string;
}>) {
  if (mediaType === "VIDEO") {
    return (
      <video controls className="h-auto w-full bg-content2" src={url}>
        <track kind="captions" />
      </video>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className="h-auto w-full object-cover"
      loading="lazy"
    />
  );
}

function PostMedia({ post }: Readonly<{ post: ElectionsInstagramPost }>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  if (post.mediaType !== "CAROUSEL_ALBUM" || post.carouselItems.length === 0) {
    return (
      <MediaItem
        url={post.displayUrl}
        mediaType={post.mediaType}
        alt="Instagram post"
      />
    );
  }

  const onScroll = () => {
    const node = carouselRef.current;
    if (!node) return;
    const width = node.clientWidth;
    if (!width) return;
    const nextIndex = Math.round(node.scrollLeft / width);
    setActiveIndex(
      Math.max(0, Math.min(nextIndex, post.carouselItems.length - 1)),
    );
  };

  return (
    <div>
      <div
        ref={carouselRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide"
      >
        {post.carouselItems.map((item) => (
          <div key={item.id} className="w-full shrink-0 snap-center">
            <MediaItem
              url={item.displayUrl}
              mediaType={item.mediaType}
              alt="Instagram carousel media"
            />
          </div>
        ))}
      </div>

      <div className="mt-2 flex justify-center gap-1.5">
        {post.carouselItems.map((item, index) => (
          <span
            key={item.id}
            className={`h-1.5 w-1.5 rounded-full ${
              index === activeIndex ? "bg-foreground" : "bg-foreground-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function ElectionsInstagramFeed() {
  const [posts, setPosts] = useState<ElectionsInstagramPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const nextCursorsRef = useRef<CursorsMap | undefined>(undefined);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchPage = useCallback(
    async (cursors?: CursorsMap, signal?: AbortSignal) => {
      const url = cursors
        ? `/api/elections/instagram?cursors=${encodeURIComponent(JSON.stringify(cursors))}`
        : "/api/elections/instagram";

      const response = await fetch(url, { signal });
      const data = (await response.json()) as FeedResponse;

      if (!response.ok || !data.posts) {
        throw new Error(
          data.details ??
            data.error ??
            "Nem sikerült betölteni az Instagram feedet",
        );
      }

      return data;
    },
    [],
  );

  // Initial load
  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await fetchPage(undefined, controller.signal);

        setPosts(data.posts ?? []);
        nextCursorsRef.current = data.nextCursors;
        setHasMore(data.hasMore ?? false);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(
          err instanceof Error
            ? err.message
            : "Nem sikerült betölteni az Instagram feedet",
        );
      } finally {
        setIsLoading(false);
      }
    }

    load();

    return () => controller.abort();
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const data = await fetchPage(nextCursorsRef.current);
      setPosts((prev) => [...prev, ...(data.posts ?? [])]);
      nextCursorsRef.current = data.nextCursors;
      setHasMore(data.hasMore ?? false);
    } catch (err) {
      console.warn("Failed to load more posts", err);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, fetchPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore) {
          loadMore();
        }
      },
      { rootMargin: "400px" },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  if (isLoading) {
    return (
      <div className="rounded-xl border-0 border-selfprimary-200 bg-selfprimary-100 p-5 text-sm text-foreground-600">
        Instagram posztok betöltése...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border-0 border-selfprimary-200 bg-selfprimary-100 p-5 text-sm text-danger">
        {error}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border-0 border-selfprimary-200 bg-selfprimary-100 p-5 text-sm text-foreground-600">
        Jelenleg nincs megjeleníthető poszt.
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
      {posts.map((post) => (
        <article
          key={post.id}
          className="overflow-hidden rounded-2xl border-0 border-selfprimary-200 bg-selfprimary-100"
        >
          <div className="px-4 pb-3 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {post.account.profilePictureUrl ? (
                  <img
                    src={post.account.profilePictureUrl}
                    alt={post.account.username}
                    className="h-9 w-9 rounded-full border-2 border-selfprimary-400 object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-foreground-200" />
                )}
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-selfprimary-800">
                    {post.account.username}
                  </p>
                  <p className="text-xs text-selfprimary-600">
                    {formatTimestamp(post.timestamp)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Chip
                  size="sm"
                  variant="bordered"
                  color="primary"
                  startContent={<HeartFilledIcon size={18} />}
                >
                  {post.likeCount}
                </Chip>
                <Link
                  href={post.permalink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-selfprimary-600 hover:text-selfprimary"
                  aria-label="Megnyitás Instagram alkalmazásban"
                >
                  <InstagramIcon size={20} />
                </Link>
              </div>
            </div>
          </div>

          <PostMedia post={post} />

          <div className="space-y-2 px-4 py-3">
            {post.caption ? (
              <p className="whitespace-pre-wrap text-sm text-selfprimary-800">
                {post.caption}
              </p>
            ) : null}
          </div>
        </article>
      ))}

      <div ref={sentinelRef} className="h-1" />

      {isLoadingMore ? (
        <div className="rounded-xl border-0 border-selfprimary-200 bg-selfprimary-100 p-5 text-center text-sm text-foreground-600">
          További posztok betöltése...
        </div>
      ) : null}
    </div>
  );
}
