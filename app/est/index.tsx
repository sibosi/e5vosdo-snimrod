"use client";
import { useState } from "react";
import Image from "next/image";
import { PodcastChannel } from "@/types/podcast";
import PodcastPlayer from "./player";

export default function PodcastPage({
  podcastData,
}: Readonly<{
  podcastData: PodcastChannel;
}>) {
  const [activeAudio, setActiveAudio] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const handlePlay = (guid: string) => {
    setActiveAudio(guid);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div>
      <header className="border-b border-foreground-200 pb-8 text-left">
        <div className="mb-2 flex flex-col items-center gap-8">
          <Image
            src={podcastData?.image}
            alt={podcastData.title}
            width={128}
            height={128}
            priority
            className="h-56 w-56 min-w-fit rounded-2xl"
            unoptimized
          />

          <h1 className="mb-2 text-3xl font-bold text-foreground-800">
            {podcastData.title}
          </h1>
        </div>
        <button
          onClick={() => {
            if (showDetails === null) {
              setShowDetails(podcastData.description);
            } else {
              setShowDetails(null);
            }
          }}
        >
          <div
            className={`mt-4 flex-1 text-justify text-base leading-relaxed text-foreground-700 md:mt-0 ${
              showDetails === podcastData.description ? "block" : "line-clamp-3"
            }`}
          >
            {podcastData.description}
          </div>
        </button>
      </header>

      <div className="py-8">
        <h2 className="mb-6 text-3xl font-bold text-foreground">
          Összes epizód
        </h2>
        <div className="space-y-4">
          {podcastData.items?.map((episode) => (
            <div
              key={episode.guid}
              className="flex flex-col overflow-hidden border-b transition-transform duration-300"
            >
              <div className="flex items-center gap-2">
                <div className="relative min-w-fit">
                  <Image
                    src={episode.image || podcastData.image}
                    alt={episode.title}
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-lg object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground-800">
                    {episode.title.split("-")[0]}
                  </h3>
                  <p className="text-sm font-medium">
                    {episode.title.split("-")[1]}
                  </p>
                </div>
              </div>

              <div className="mt-1">
                <button
                  className="text-left"
                  onClick={() =>
                    setShowDetails(
                      showDetails === episode.guid ? null : episode.guid,
                    )
                  }
                >
                  {showDetails === episode.guid ? (
                    <div
                      className="text-base leading-relaxed text-foreground-700"
                      dangerouslySetInnerHTML={{ __html: episode.description }}
                    />
                  ) : (
                    <div
                      className="line-clamp-2 text-base leading-relaxed text-foreground-700"
                      dangerouslySetInnerHTML={{ __html: episode.description }}
                    />
                  )}
                </button>

                <p className="mb-4 text-sm text-foreground-500">
                  {formatDate(episode.pubDate)}
                </p>

                <PodcastPlayer
                  audioUrl={episode.enclosure.url}
                  isPlaying={activeAudio === episode.guid}
                  onPlay={() => handlePlay(episode.guid)}
                  onPause={() => setActiveAudio(null)}
                  duration={episode.duration}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
