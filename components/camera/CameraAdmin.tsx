"use client";

import React, { useState } from "react";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import CameraUpload from "./CameraUpload";
import PhotoGallery from "./PhotoGallery";

export default function CameraAdmin() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("directory", "camera-photos");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Feltöltési hiba");
      }

      alert("Kép sikeresen feltöltve!");

      // Trigger gallery refresh
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Feltöltési hiba:", error);
      alert(
        `Feltöltési hiba: ${error instanceof Error ? error.message : "Ismeretlen hiba"}`,
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col">
            <p className="text-md font-semibold">Kamera Admin</p>
            <p className="text-small text-default-500">
              Készítsd el és töltsd fel a képeket a galériába
            </p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <CameraUpload onUpload={handleUpload} isUploading={isUploading} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col">
            <p className="text-md font-semibold">Képgaléria</p>
            <p className="text-small text-default-500">
              A legújabb kép nagyban, a korábbiak kicsiben
            </p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <PhotoGallery refreshTrigger={refreshTrigger} />
        </CardBody>
      </Card>
    </div>
  );
}
