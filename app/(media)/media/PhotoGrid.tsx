"use client";

import { MediaImageType } from "@/db/mediaPhotos";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * Lazy loading kép komponens - csak akkor tölti be, ha látható.
 */
const LazyImage = ({
  imageId,
  fileName,
  bgColor,
  width,
  height,
  size = "small",
  onClick,
}: {
  imageId: number;
  fileName: string;
  bgColor?: string;
  width: number;
  height: number;
  size?: "small" | "large";
  onClick?: () => void;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer - figyeli, hogy a kép látható-e
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Ha egyszer látható lett, többé nem kell figyelni
            observer.unobserve(element);
          }
        });
      },
      {
        rootMargin: "200px", // 200px-el a viewport előtt elkezdi betölteni
        threshold: 0,
      },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, []);

  const src = `/api/media/${imageId}?size=${size}`;

  return (
    <div
      ref={containerRef}
      style={{ width, height, backgroundColor: bgColor ?? "gray" }}
      className="cursor-pointer"
      onClick={onClick}
    >
      {!isVisible ? (
        // Placeholder amíg nem látható
        <div
          style={{ width, height }}
          className="flex items-center justify-center"
        />
      ) : error ? (
        <div
          style={{ width, height }}
          className="flex items-center justify-center bg-red-100 text-sm text-red-500"
        >
          <p>Hiba</p>
        </div>
      ) : (
        <>
          {!loaded && (
            <div
              style={{ width, height }}
              className="flex items-center justify-center text-sm text-gray-500"
            >
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
            </div>
          )}
          <img
            src={src}
            alt={fileName}
            width={width}
            height={height}
            className={`object-cover ${loaded ? "" : "hidden"}`}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        </>
      )}
    </div>
  );
};

const PhotoGrid = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [imageFiles, setImageFiles] = useState<MediaImageType[]>();
  const [selected, setSelected] = useState<MediaImageType | null>(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  useEffect(() => {
    const updateWidth = () => {
      const width = Math.min(window.innerWidth - 32, 1200);
      setContainerWidth(width);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  function loadImages() {
    setLoading(true);
    fetch("/api/getImages", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        module: "mediaPhotos",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setImageFiles(data);
        } else {
          console.error("Invalid response:", data);
          setError("Nem sikerült betölteni a képeket");
        }
      })
      .catch((err) => {
        console.error("Error fetching images:", err);
        setError("Hiba a képek betöltésekor");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadImages();
  }, []);

  const handleNextImage = useCallback(() => {
    if (!selected || !imageFiles) return;
    setSelected(null);
    const currentIndex = imageFiles.findIndex((img) => img.id === selected.id);
    const nextIndex = (currentIndex + 1) % imageFiles.length;
    setSelected(imageFiles[nextIndex]);
    fetch(`/api/media/${imageFiles[nextIndex + 1].id}?size=large`);
    fetch(`/api/media/${imageFiles[nextIndex + 2].id}?size=large`);
  }, [selected, imageFiles]);

  const handlePreviousImage = useCallback(() => {
    if (!selected || !imageFiles) return;
    setSelected(null);
    const currentIndex = imageFiles.findIndex((img) => img.id === selected.id);
    const previousIndex =
      (currentIndex - 1 + imageFiles.length) % imageFiles.length;
    setSelected(imageFiles[previousIndex]);
    fetch(`/api/media/${imageFiles[previousIndex - 1].id}?size=large`);
    fetch(`/api/media/${imageFiles[previousIndex - 2].id}?size=large`);
  }, [selected, imageFiles]);

  const closeModal = useCallback(() => setSelected(null), []);

  const organizeImagesIntoRows = useCallback(
    (images: MediaImageType[]) => {
      const rows: Array<
        Array<MediaImageType & { displayWidth: number; displayHeight: number }>
      > = [];
      const maxRowHeight = 150;
      const gap = 8;
      const minImagesPerRow = 3;

      let currentRow: Array<
        MediaImageType & { displayWidth: number; displayHeight: number }
      > = [];
      let currentRowWidth = 0;

      images.forEach((image, index) => {
        // Használjuk a small preview méreteit, vagy becsüljük 4:3 arányra
        const imgWidth = image.small_preview_width || 200;
        const imgHeight = image.small_preview_height || 150;
        const aspectRatio = imgWidth / imgHeight;
        const imageHeight = maxRowHeight;
        const imageWidth = imageHeight * aspectRatio;

        if (
          currentRowWidth + imageWidth + currentRow.length * gap >
            containerWidth &&
          currentRow.length >= minImagesPerRow
        ) {
          // Sor méretezése
          const totalGaps = (currentRow.length - 1) * gap;
          const availableWidth = containerWidth - totalGaps;
          const scaleFactor = availableWidth / currentRowWidth;

          currentRow.forEach((img) => {
            img.displayWidth *= scaleFactor;
            img.displayHeight *= scaleFactor;
          });

          rows.push(currentRow);
          currentRow = [];
          currentRowWidth = 0;
        }

        currentRow.push({
          ...image,
          displayWidth: imageWidth,
          displayHeight: imageHeight,
        });
        currentRowWidth += imageWidth;

        // Utolsó sor
        if (index === images.length - 1 && currentRow.length > 0) {
          const totalGaps = (currentRow.length - 1) * gap;
          const availableWidth = containerWidth - totalGaps;
          if (currentRowWidth > availableWidth) {
            const scaleFactor = availableWidth / currentRowWidth;
            currentRow.forEach((img) => {
              img.displayWidth *= scaleFactor;
              img.displayHeight *= scaleFactor;
            });
          }
          rows.push(currentRow);
        }
      });

      return rows;
    },
    [containerWidth],
  );

  const imageRows = useMemo(() => {
    if (!imageFiles) return [];
    return organizeImagesIntoRows(imageFiles);
  }, [imageFiles, organizeImagesIntoRows]);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") handleNextImage();
      if (e.key === "ArrowLeft") handlePreviousImage();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, closeModal, handleNextImage, handlePreviousImage]);

  const downloadOriginal = useCallback(
    async (imageId: number, suggestedName?: string | null) => {
      try {
        const res = await fetch(`/api/media/${imageId}?size=full`);
        if (!res.ok) {
          throw new Error(`Download failed: ${res.status}`);
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = suggestedName || "image.webp";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch (e) {
        console.error(e);
        alert("A letöltés nem sikerült.");
      }
    },
    [],
  );

  if (loading) {
    return <div className="p-8">Betöltés...</div>;
  }

  if (error) {
    return (
      <div className="mb-4 rounded-3xl border-2 border-danger-400 bg-danger-100 p-4">
        <p className="text-danger-700">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 rounded bg-danger-500 px-4 py-2 text-foreground"
        >
          Újratöltés
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Eötvös Média - Galéria</h1>
      </div>

      {imageFiles === undefined && (
        <div className="p-8 text-center">
          <p>Képek betöltése...</p>
        </div>
      )}

      {imageFiles?.length === 0 ? (
        <div className="p-8 text-center">
          <p>Nincsenek képek a galériában.</p>
          <button
            onClick={() => loadImages()}
            className="mt-4 rounded bg-selfprimary-500 px-4 py-2 text-selfprimary-50"
          >
            Újratöltés
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {imageRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-2">
              {row.map((image) => (
                <LazyImage
                  key={image.id}
                  imageId={image.id}
                  fileName={image.original_file_name ?? "image"}
                  bgColor={image.color}
                  width={Math.round(image.displayWidth)}
                  height={Math.round(image.displayHeight)}
                  size="small"
                  onClick={() => setSelected(image)}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {selected && (
        <ImageModal
          image={selected}
          onClose={closeModal}
          onDownload={() =>
            downloadOriginal(selected.id, selected.original_file_name)
          }
          handleNextImage={handleNextImage}
          handlePreviousImage={handlePreviousImage}
        />
      )}
    </div>
  );
};

const ImageModal = ({
  image,
  onClose,
  onDownload,
  handleNextImage,
  handlePreviousImage,
}: {
  image: MediaImageType;
  onClose: () => void;
  onDownload: () => void;
  handleNextImage: () => void;
  handlePreviousImage: () => void;
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const title = image.original_file_name || "Kép";
  const src = `/api/media/${image.id}?size=large`;

  // Reseteljük a loaded state-et, amikor új képre vált
  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [image.id]);

  // Fullscreen API kezelése
  useEffect(() => {
    if (isFullscreen) {
      // Belépés natív fullscreen módba
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("Fullscreen request failed:", err);
      });
    } else {
      // Kilépés fullscreen módból
      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err) => {
          console.error("Exit fullscreen failed:", err);
        });
      }
    }

    // Figyeljük a fullscreen változásokat (pl. F11 vagy ESC)
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isFullscreen]);

  // Fullscreen mód
  if (isFullscreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black"
        onClick={() => setIsFullscreen(false)}
      >
        {!loaded && !error && (
          <div className="p-8 text-sm text-foreground-600">Betöltés…</div>
        )}
        {error && (
          <div className="p-8 text-sm text-danger-600">
            Hiba a kép betöltésekor
          </div>
        )}
        <img
          src={src}
          alt={title}
          className={`max-h-screen w-auto max-w-full object-contain ${
            loaded ? "" : "hidden"
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNextImage();
          }}
          className="absolute right-4 h-12 w-12 rounded-full bg-foreground-300 text-center text-2xl opacity-70 hover:opacity-100"
        >
          ➜
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePreviousImage();
          }}
          className="absolute left-4 h-12 w-12 rotate-180 rounded-full bg-foreground-300 text-center text-2xl opacity-70 hover:opacity-100"
        >
          ➜
        </button>

        <div className="absolute right-4 top-4 flex gap-2">
          <button
            className="rounded bg-selfprimary-600 px-3 py-2 text-sm text-foreground-50"
            onClick={onDownload}
          >
            Letöltés
          </button>
          <button
            className="rounded bg-selfprimary-600 px-3 py-2 text-sm text-foreground-50"
            onClick={() => setIsFullscreen(true)}
          >
            Fullscreen
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreen(false);
            }}
            className="rounded bg-danger-600 px-3 py-2 text-sm text-foreground-50 hover:bg-danger-700"
          >
            Kilépés
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative z-10 max-h-[90vh] w-[92vw] max-w-5xl rounded-xl bg-selfprimary-bg p-3 shadow-2xl">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2
            className="truncate text-lg font-semibold text-selfprimary-800"
            title={title}
          >
            {title}
          </h2>
          <div className="flex gap-2">
            <button
              className="rounded bg-selfprimary-600 px-3 py-2 text-sm text-foreground-50"
              onClick={onDownload}
            >
              Letöltés
            </button>
            <button
              className="rounded bg-selfprimary-600 px-3 py-2 text-sm text-foreground-50"
              onClick={() => setIsFullscreen(true)}
            >
              Fullscreen
            </button>
            <button
              className="rounded bg-selfsecondary-600 px-3 py-2 text-sm text-foreground-50"
              onClick={onClose}
            >
              Bezárás
            </button>
          </div>
        </div>

        <div
          className="flex max-h-[80vh] items-center justify-center overflow-auto rounded-lg border"
          style={{ backgroundColor: image.color ?? "#f3f4f6" }}
        >
          {!loaded && !error && (
            <div className="p-8 text-sm text-foreground-600">Betöltés…</div>
          )}
          {error && (
            <div className="p-8 text-sm text-danger-600">
              Hiba a kép betöltésekor
            </div>
          )}
          <img
            src={src}
            alt={title}
            className={`max-h-[80vh] w-auto max-w-full object-contain ${loaded ? "" : "hidden"}`}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
          <button
            onClick={handleNextImage}
            className="absolute right-0 h-10 w-10 items-center rounded-full bg-foreground-300 text-center text-lg opacity-70 hover:opacity-100"
          >
            ➜
          </button>
          <button
            onClick={handlePreviousImage}
            className="absolute left-0 h-10 w-10 rotate-180 items-center rounded-full bg-foreground-300 text-center text-lg opacity-70 hover:opacity-100"
          >
            ➜
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoGrid;
