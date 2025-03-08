"use client";
import { Chip } from "@heroui/react";
import { useState, useRef, useEffect } from "react";

interface PodcastPlayerProps {
  audioUrl: string;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  duration: string;
}

const PodcastPlayer = ({
  audioUrl,
  isPlaying,
  onPlay,
  onPause,
  duration,
}: PodcastPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  // Parse duration string (format: HH:MM:SS)
  useEffect(() => {
    if (duration) {
      const parts = duration.split(":").map((part) => parseInt(part, 10));
      let seconds = 0;
      if (parts.length === 3) {
        seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 2) {
        seconds = parts[0] * 60 + parts[1];
      } else if (parts.length === 1) {
        seconds = parts[0];
      }
      setAudioDuration(seconds);
    }
  }, [duration]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      if (isPlaying) {
        audio.play().catch((error) => {
          console.error("Error playing audio:", error);
          onPause();
        });
      }
    };

    const handleEnded = () => {
      onPause();
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [isPlaying, onPause]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
        onPause();
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, onPause]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    audio.currentTime = newTime;
  };

  const togglePlay = () => {
    if (isPlaying) onPause();
    else onPlay();
  };

  const formatDuration = (duration: number) => {
    const mins = Math.floor(duration / 60);
    return `${mins} perc`;
  };

  return (
    <div className="mt-4">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="mb-4 flex items-center gap-4">
        <button onClick={togglePlay} disabled={isLoading}>
          <Chip
            variant="bordered"
            size="lg"
            color="primary"
            startContent={(() => {
              if (isLoading) return <span className="animate-spin">⏳</span>;
              if (isPlaying)
                return (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zm0 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-2.5 4.5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0v-5a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0v-5a.5.5 0 0 1 .5-.5z"
                    />
                  </svg>
                );
              return (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                  <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445" />
                </svg>
              );
            })()}
          >
            <span className="ml-1">{formatDuration(audioDuration)}</span>
          </Chip>
        </button>

        <div className="flex-1">
          <input
            type="range"
            min="0"
            max={audioDuration || 100}
            value={currentTime}
            onChange={handleProgressChange}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-foreground-200 accent-selfprimary-600"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(audioDuration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PodcastPlayer;
