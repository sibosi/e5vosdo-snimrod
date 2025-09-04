"use client";

import React from "react";
import { Button } from "@heroui/react";
import Link from "next/link";
import PhotoGallery from "./PhotoGallery";

interface CameraDisplayProps {
  readonly autoRefresh?: boolean;
  readonly refreshInterval?: number; // milliseconds
}

export default function CameraDisplay({
  autoRefresh = false,
  refreshInterval = 30000,
}: CameraDisplayProps) {
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  React.useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setRefreshTrigger((prev) => prev + 1);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  return (
    <div className="mx-auto w-full max-w-4xl p-4">
      <div className="mb-6 text-center">
        <h2 className="mb-2 text-2xl font-bold">Élő Képek</h2>
        <p className="text-gray-600 dark:text-gray-400">
          A legfrissebb pillanatok
        </p>
      </div>
      <PhotoGallery refreshTrigger={refreshTrigger} />

      {/* Link to full gallery */}
      <div className="mt-8 text-center">
        <Link href="/camera-gallery">
          <Button color="primary" variant="flat" size="lg" className="min-w-48">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 16 16"
              className="mr-2"
            >
              <path d="M10.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
              <path d="M2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586L9.828 1.828A2 2 0 0 0 8.414 1.242H7.586a2 2 0 0 0-1.414.586L4.586 3.414A2 2 0 0 1 3.172 4zm.5 2a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1m9 2.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0" />
            </svg>
            Összes kép megtekintése
          </Button>
        </Link>
        <p className="mt-2 text-sm text-gray-500">
          Tekintsd meg az összes feltöltött képet a teljes galériában
        </p>
      </div>
    </div>
  );
}
