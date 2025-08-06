"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

interface ImageFile {
  id: string;
  name: string;
  url: string;
}

const PhotoWall: React.FC = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/drive/");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Hiba");
        setImages(data.files);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p className="p-4 text-center">Betöltés...</p>;
  if (error)
    return <p className="p-4 text-center text-red-500">Hiba: {error}</p>;
  if (images.length === 0)
    return <p className="p-4 text-center">Nincsenek képek.</p>;

  return (
    <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {images.map((img) => (
        <div
          key={img.id}
          className="relative h-0 w-full overflow-hidden rounded pb-[100%] shadow"
        >
          <Image
            src={img.url}
            alt={img.name}
            fill
            className="object-cover transition-transform hover:scale-105"
          />
        </div>
      ))}
    </div>
  );
};

export default PhotoWall;
