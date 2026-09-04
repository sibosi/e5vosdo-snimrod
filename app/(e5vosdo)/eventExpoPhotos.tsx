"use client";

import type { MediaImageType } from "@/db/mediaPhotos";
import { useEffect, useRef, useState } from "react";

const mediaUrl = (image: MediaImageType, size: "small" | "large") =>
  `/api/media/${image.id}?size=${size}`;

export default function EventExpoPhotos() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<MediaImageType[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/event/expo-photo")
      .then((response) => {
        if (!response.ok) throw new Error("A képek nem tölthetők be.");
        return response.json();
      })
      .then((data: { images?: MediaImageType[] }) =>
        setImages(data.images ?? []),
      )
      .catch((loadError: unknown) => {
        setError(
          loadError instanceof Error ? loadError.message : "Hiba történt.",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Csak képet válassz.");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
  };

  const handleUpload = async () => {
    if (!selectedFile || !confirmed) return;
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("confirmed", "true");

    try {
      const response = await fetch("/api/event/expo-photo", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "A feltöltés sikertelen.");
      if (data.image) setImages((current) => [data.image, ...current]);
      setSelectedFile(null);
      setConfirmed(false);
      setPreviewUrl(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (uploadError: unknown) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Hiba történt.",
      );
    } finally {
      setUploading(false);
    }
  };

  const latestImage = images[0];
  const previousImages = images.slice(1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] md:items-start">
        <div className="aspect-square overflow-hidden rounded-xl bg-selfprimary-100">
          {latestImage ? (
            <img
              src={mediaUrl(latestImage, "large")}
              alt="A legutóbb feltöltött expo-kép"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center text-selfprimary-700">
              {loading ? "Képek betöltése..." : "Még nincs feltöltött kép."}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleFileChange}
            className="sr-only"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full rounded-xl bg-selfprimary-800 px-4 py-3 font-semibold text-white transition hover:bg-selfprimary-900"
          >
            {selectedFile ? "Másik kép készítése" : "Kép készítése"}
          </button>

          {previewUrl && (
            <div className="aspect-square overflow-hidden rounded-xl bg-selfprimary-100">
              <img
                src={previewUrl}
                alt="A készülő expo-kép előnézete"
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <label className="flex gap-3 text-sm text-selfprimary-900">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-selfprimary-800"
            />
            <span>
              Igazolom, hogy a kép az iskolában készült és az expóhoz
              kapcsolódik.
            </span>
          </label>

          <button
            type="button"
            disabled={!selectedFile || !confirmed || uploading}
            onClick={handleUpload}
            className="text-selfprimary-950 w-full rounded-xl bg-selfsecondary-500 px-4 py-3 font-semibold transition hover:bg-selfsecondary-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? "Feltöltés..." : "Kép feltöltése"}
          </button>

          {error && <p className="text-sm text-red-700">{error}</p>}
        </div>
      </div>

      {previousImages.length > 0 && (
        <div className="overflow-x-auto pb-2">
          <div className="flex w-max gap-3">
            {previousImages.map((image) => (
              <img
                key={image.id}
                src={mediaUrl(image, "small")}
                alt="Korábbi expo-kép"
                className="h-24 w-24 rounded-lg object-cover"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
