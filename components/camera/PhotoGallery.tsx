"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, Skeleton } from "@heroui/react";

interface PhotoGalleryProps {
  refreshTrigger?: number; // prop to force refresh
}

interface ImageData {
  name: string;
  url: string;
  created_at?: string;
}

export default function PhotoGallery({
  refreshTrigger = 0,
}: PhotoGalleryProps) {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/camera-photos");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Hiba a képek betöltésekor");
      }

      // Sort images by creation time (newest first)
      const sortedImages = data.sort((a: ImageData, b: ImageData) => {
        const timeA = new Date(a.created_at || a.name).getTime();
        const timeB = new Date(b.created_at || b.name).getTime();
        return timeB - timeA;
      });

      setImages(sortedImages);
    } catch (err) {
      console.error("Hiba a képek betöltésekor:", err);
      setError(err instanceof Error ? err.message : "Ismeretlen hiba");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <Card className="aspect-video">
            <CardBody className="p-0">
              <Skeleton className="h-full w-full rounded-lg" />
            </CardBody>
          </Card>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="aspect-square">
                <CardBody className="p-0">
                  <Skeleton className="h-full w-full rounded-lg" />
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-4xl p-4">
        <Card className="border-danger">
          <CardBody>
            <p className="text-center text-danger">{error}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl p-4">
        <Card>
          <CardBody>
            <p className="text-center text-gray-500">
              Még nincsenek feltöltött képek
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const mainImage = images[0];
  const thumbnailImages = images.slice(1, 4);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      {/* Main large image */}
      <Card className="overflow-hidden">
        <CardBody className="p-0">
          <div className="relative aspect-video">
            <img
              src={mainImage.url}
              alt={`Kép: ${mainImage.name}`}
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-sm text-white">
              Legújabb kép
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Three smaller images */}
      {thumbnailImages.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {thumbnailImages.map((image, index) => (
            <Card key={image.name} className="overflow-hidden">
              <CardBody className="p-0">
                <div className="relative aspect-square">
                  <img
                    src={image.url}
                    alt={`Kép: ${image.name}`}
                    className="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
                  />
                  <div className="absolute bottom-1 right-1 rounded bg-black/50 px-1 py-0.5 text-xs text-white">
                    #{index + 2}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}

          {/* Fill remaining slots with placeholders if needed */}
          {Array.from({ length: Math.max(0, 3 - thumbnailImages.length) }).map(
            (_, index) => (
              <Card key={`placeholder-${index}`} className="overflow-hidden">
                <CardBody className="p-0">
                  <div className="flex aspect-square items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <span className="text-sm text-gray-400">Nincs kép</span>
                  </div>
                </CardBody>
              </Card>
            ),
          )}
        </div>
      )}
    </div>
  );
}
