"use client";

import { useState, useEffect } from "react";
import { PodcastChannel, PodcastItem } from "@/types/podcast";

export function usePodcast() {
  const [podcast, setPodcast] = useState<PodcastChannel | null>(null);
  const [latestEpisode, setLatestEpisode] = useState<PodcastItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPodcast() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/podcast");

        if (!response.ok) {
          throw new Error("Failed to fetch podcast data");
        }

        const data: PodcastChannel = await response.json();
        setPodcast(data);

        if (data.items && data.items.length > 0) {
          setLatestEpisode(data.items[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        console.error("Error fetching podcast:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPodcast();
  }, []);

  return { podcast, latestEpisode, isLoading, error };
}
