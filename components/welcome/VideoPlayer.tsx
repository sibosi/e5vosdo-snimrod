"use client";

interface VideoPlayerProps {
  videoId: string;
  title: string;
}

export default function VideoPlayer({
  videoId,
  title,
}: Readonly<VideoPlayerProps>) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
