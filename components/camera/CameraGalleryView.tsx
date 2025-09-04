"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Skeleton,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  useDisclosure,
  Button,
  Chip,
} from "@heroui/react";

interface ImageData {
  id: string;
  name: string;
  url: string;
  created_at?: string;
}

export default function CameraGalleryView() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

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
  }, []);

  const openImageModal = (image: ImageData) => {
    setSelectedImage(image);
    onOpen();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Ismeretlen dátum";

    try {
      const date = new Date(dateString);
      return date.toLocaleString("hu-HU", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Ismeretlen dátum";
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 12 }).map((_, index) => (
          <Card key={index} className="aspect-square">
            <CardBody className="p-0">
              <Skeleton className="h-full w-full rounded-lg" />
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-danger">
        <CardBody>
          <div className="text-center">
            <p className="mb-4 text-danger">{error}</p>
            <Button color="primary" onPress={fetchImages}>
              Újrapróbálás
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (images.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="py-8 text-center">
            <p className="mb-4 text-lg text-gray-500">
              Még nincsenek feltöltött képek
            </p>
            <p className="text-sm text-gray-400">
              Használd a kamera modult képek készítéséhez
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Chip color="primary" variant="flat">
            {images.length} kép
          </Chip>
        </div>
        <Button color="primary" variant="flat" onPress={fetchImages} size="sm">
          Frissítés
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {images.map((image, index) => (
          <Card
            key={image.id}
            className="aspect-square cursor-pointer overflow-hidden transition-transform duration-200 hover:scale-105"
            onPress={() => openImageModal(image)}
            isPressable
          >
            <CardBody className="p-0">
              <div className="relative h-full w-full">
                <img
                  src={image.url}
                  alt={`Kép: ${image.name}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute bottom-1 left-1 rounded bg-black/70 px-2 py-1 text-xs text-white">
                  #{index + 1}
                </div>
                {index === 0 && (
                  <div className="absolute right-1 top-1 rounded bg-green-500 px-2 py-1 text-xs text-white">
                    Legújabb
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Image Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl" backdrop="blur">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">Kép részletek</h2>
            {selectedImage && (
              <p className="text-sm text-gray-500">
                {formatDate(selectedImage.created_at)}
              </p>
            )}
          </ModalHeader>
          <ModalBody className="pb-6">
            {selectedImage && (
              <div className="space-y-4">
                <div className="relative aspect-video overflow-hidden rounded-lg">
                  <img
                    src={selectedImage.url}
                    alt={`Kép: ${selectedImage.name}`}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                  <div>
                    <span className="font-semibold text-gray-600 dark:text-gray-400">
                      Fájlnév:
                    </span>
                    <p className="mt-1 break-all">{selectedImage.name}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-600 dark:text-gray-400">
                      Létrehozva:
                    </span>
                    <p className="mt-1">
                      {formatDate(selectedImage.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
