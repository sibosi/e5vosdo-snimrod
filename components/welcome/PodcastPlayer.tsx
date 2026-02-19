"use client";
import { useState, useRef, useEffect } from "react";
import { PlayIcon, PauseIcon } from "@heroicons/react/24/solid";
import { Button, Slider } from "@heroui/react";

interface PodcastPlayerProps {
  readonly title: string;
  readonly episode: string;
  readonly audioUrl?: string;
  readonly coverImage?: string;
}

export default function PodcastPlayer({
  title,
  episode,
  audioUrl = "/podcasts/sample.mp3",
  coverImage = "/e5podcast/e5podcast_tote.png",
}: PodcastPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", () => setIsPlaying(false));

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", () => setIsPlaying(false));
    };
  }, []);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number | number[]) => {
    const time = Array.isArray(value) ? value[0] : value;
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    if (Number.isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="backdrop-blur-xs rounded-lg bg-foreground/10 p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="bg-linear-to-br relative h-16 w-16 shrink-0 overflow-hidden rounded-lg from-pink-500 to-rose-600">
          <img
            src={coverImage}
            alt="Podcast cover"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {title}
          </p>
          <p className="text-xs text-foreground/70">{episode}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Button
            isIconOnly
            size="sm"
            className="bg-foreground/20 text-foreground hover:bg-foreground/30"
            onPress={togglePlayPause}
          >
            {isPlaying ? (
              <PauseIcon className="h-4 w-4" />
            ) : (
              <PlayIcon className="h-4 w-4" />
            )}
          </Button>

          <div className="flex-1">
            <Slider
              size="sm"
              step={0.1}
              maxValue={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full"
              classNames={{
                track: "bg-foreground/20",
                filler: "bg-foreground",
                thumb: "bg-foreground",
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-foreground/70">
          <span>{formatTime(currentTime)}</span>
          <span>
            Teljes részek az{" "}
            <a href="/est" className="underline hover:text-foreground">
              epizódik
            </a>{" "}
            oldalon
          </span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <audio ref={audioRef} src={audioUrl}>
        <track kind="captions" />
      </audio>
    </div>
  );
}
