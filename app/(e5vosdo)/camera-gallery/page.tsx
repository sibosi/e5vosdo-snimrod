import { Metadata } from "next";
import CameraGalleryView from "@/components/camera/CameraGalleryView";

export const metadata: Metadata = {
  title: "Kamera Galéria | E5vösdő",
  description: "Az összes feltöltött kamera kép megtekintése",
};

export default function CameraGalleryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Kamera Galéria</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Az összes feltöltött kép megtekintése
        </p>
      </div>

      <CameraGalleryView />
    </div>
  );
}
