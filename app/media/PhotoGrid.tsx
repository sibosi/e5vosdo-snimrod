"use client";
import Image from "next/image";
import React from "react";
import { useImageToken } from "@/hooks/useImageToken";

interface DriveImage {
  id: string;
  name: string;
  mimeType: string;
}

const MasonryGrid: React.FC = () => {
  const [images, setImages] = React.useState<DriveImage[]>([]);
  const [selectedImageId, setSelectedImageId] = React.useState<string | null>(
    null,
  );
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { getImageUrl } = useImageToken();

  React.useEffect(() => {
    const loadImages = async () => {
      try {
        const res = await fetch("/api/drive/");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        const imgs: DriveImage[] = data.files.filter((f: any) =>
          f.mimeType.startsWith("image/"),
        );
        setImages(imgs);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadImages();
  }, []);

  if (loading) return <p className="p-4 text-center">Betöltés...</p>;
  if (error)
    return <p className="p-4 text-center text-red-500">Hiba: {error}</p>;
  if (images.length === 0)
    return <p className="p-4 text-center">Nincsenek képek.</p>;

  if (selectedImageId === null) {
    return (
      <div className="flex w-fit flex-wrap justify-center gap-4">
        {images.map((image) => (
          <button
            key={image.id}
            className="relative bg-selfprimary-500"
            style={{ width: 100, height: 100 }}
            onClick={() => setSelectedImageId(image.id)}
          >
            <Image
              src={getImageUrl(image.id)}
              alt={image.name}
              fill
              className="h-auto w-full object-cover"
            />
          </button>
        ))}
      </div>
    );
  }

  const selectedImage = images.find((img) => img.id === selectedImageId);
  if (!selectedImage) return <p>Image not found</p>;

  return (
    <div className="flex flex-col items-center">
      <button
        className="mb-4 rounded bg-selfprimary-500 px-4 py-2 text-white"
        onClick={() => setSelectedImageId(null)}
      >
        Back to Grid
      </button>
      <div className="relative w-full max-w-3xl">
        <Image
          src={getImageUrl(selectedImage.id)}
          alt={selectedImage.name}
          width={800}
          height={600}
          className="h-auto w-full object-cover"
          priority={false}
          quality={100}
        />
      </div>
    </div>
  );
};

export default MasonryGrid;
