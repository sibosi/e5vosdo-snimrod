"use client";

import { MediaImageType } from "@/db/mediaPhotos";
import { MediaTagType } from "@/db/mediaTags";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

function getYouTubeIdFromUrl(url?: string): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      const shortId = parsed.pathname.replace(/^\//, "").trim();
      return shortId.length === 11 ? shortId : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const fromQuery = parsed.searchParams.get("v");
      if (fromQuery?.length === 11) return fromQuery;

      const parts = parsed.pathname.split("/").filter(Boolean);
      const embedIndex = parts.indexOf("embed");
      if (embedIndex >= 0) {
        const embedded = parts[embedIndex + 1];
        return embedded?.length === 11 ? embedded : null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function getYouTubeEmbedUrl(url?: string): string | null {
  const id = getYouTubeIdFromUrl(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

function getYouTubeThumbnailUrl(url?: string): string | null {
  const id = getYouTubeIdFromUrl(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

/**
 * Lazy loading kép komponens - csak akkor tölti be, ha látható.
 */
const LazyMedia = ({
  media,
  bgColor,
  width,
  height,
  size = "small",
  onClick,
}: {
  media: MediaImageType;
  bgColor?: string;
  width: number;
  height: number;
  size?: "small" | "large";
  onClick?: () => void;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLButtonElement>(null);

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

  const src =
    media.media_type === "video"
      ? getYouTubeThumbnailUrl(media.video_url)
      : `/api/media/${media.id}?size=${size}`;

  let content: React.ReactNode;
  if (!isVisible) {
    content = (
      <div
        style={{ width, height }}
        className="flex items-center justify-center"
      />
    );
  } else if (error) {
    content = (
      <div
        style={{ width, height }}
        className="flex items-center justify-center bg-red-100 text-sm text-red-500"
      >
        <p>Hiba</p>
      </div>
    );
  } else {
    content = (
      <>
        {!loaded && (
          <div
            style={{ width, height }}
            className="flex items-center justify-center text-sm text-gray-500"
          >
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
          </div>
        )}
        {src ? (
          <img
            src={src}
            alt={media.original_file_name ?? "image"}
            width={width}
            height={height}
            className={`object-cover ${loaded ? "" : "hidden"}`}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        ) : (
          <div
            style={{ width, height }}
            className="flex items-center justify-center bg-red-100 text-sm text-red-500"
          >
            <p>Hibás videó URL</p>
          </div>
        )}
        {media.media_type === "video" && loaded && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-black/55 px-3 py-1 text-sm text-white">
              Lejátszás
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <button
      type="button"
      ref={containerRef}
      style={{ width, height, backgroundColor: bgColor ?? "gray" }}
      className="relative block cursor-pointer overflow-hidden border-0 p-0 text-left align-top"
      onClick={onClick}
      aria-label={media.original_file_name ?? "Média megnyitása"}
    >
      {content}
    </button>
  );
};

const PhotoGrid = ({
  requiredTag,
  filterTags = [],
  matchAll = false,
}: {
  requiredTag?: string;
  filterTags?: string[];
  matchAll?: boolean;
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [imageFiles, setImageFiles] = useState<MediaImageType[]>();
  const [selected, setSelected] = useState<MediaImageType | null>(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  useEffect(() => {
    const updateWidth = () => {
      const min1 =
        window.innerWidth < 1024
          ? window.innerWidth - 32
          : window.innerWidth - 300;
      const width = Math.min(min1, 1200);
      setContainerWidth(width);
    };

    updateWidth();
    globalThis.addEventListener("resize", updateWidth);
    return () => globalThis.removeEventListener("resize", updateWidth);
  }, []);

  function loadImages() {
    setLoading(true);

    // Ha van requiredTag vagy filterTags
    const hasFilters = requiredTag || filterTags.length > 0;

    if (hasFilters) {
      // Készítsük el a kérést a szerver felé
      // requiredTag mindig ÉS kapcsolatban van, filterTags között a matchAll dönt
      // Az options objektum egyetlen paraméterként kerül átadásra
      fetch("/api/searchImagesByTags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          module: "mediaTags",
        },
        body: JSON.stringify({
          options: {
            tagNames: filterTags,
            matchAll: matchAll,
            requiredTag: requiredTag || null,
          },
        }),
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
    } else {
      // Ha nincs szűrő
      fetch("/api/getImages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          module: "mediaPhotos",
        },
        body: JSON.stringify({
          options: { byName: true, includeVideos: true },
        }),
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
  }

  useEffect(() => {
    loadImages();
  }, [requiredTag, filterTags.join(","), matchAll]);

  const handleNextImage = useCallback(() => {
    if (!selected || !imageFiles) return;
    setSelected(null);
    const currentIndex = imageFiles.findIndex((img) => img.id === selected.id);
    const nextIndex = (currentIndex + 1) % imageFiles.length;
    setSelected(imageFiles[nextIndex]);

    const prefetch1 = imageFiles[(nextIndex + 1) % imageFiles.length];
    const prefetch2 = imageFiles[(nextIndex + 2) % imageFiles.length];

    if (prefetch1 && (prefetch1.media_type ?? "image") === "image") {
      fetch(`/api/media/${prefetch1.id}?size=large`);
    }
    if (prefetch2 && (prefetch2.media_type ?? "image") === "image") {
      fetch(`/api/media/${prefetch2.id}?size=large`);
    }
  }, [selected, imageFiles]);

  const handlePreviousImage = useCallback(() => {
    if (!selected || !imageFiles) return;
    setSelected(null);
    const currentIndex = imageFiles.findIndex((img) => img.id === selected.id);
    const previousIndex =
      (currentIndex - 1 + imageFiles.length) % imageFiles.length;
    setSelected(imageFiles[previousIndex]);

    const prefetch1 =
      imageFiles[(previousIndex - 1 + imageFiles.length) % imageFiles.length];
    const prefetch2 =
      imageFiles[(previousIndex - 2 + imageFiles.length) % imageFiles.length];

    if (prefetch1 && (prefetch1.media_type ?? "image") === "image") {
      fetch(`/api/media/${prefetch1.id}?size=large`);
    }
    if (prefetch2 && (prefetch2.media_type ?? "image") === "image") {
      fetch(`/api/media/${prefetch2.id}?size=large`);
    }
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
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
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
          onClick={() => globalThis.location.reload()}
          className="mt-2 rounded-sm bg-danger-500 px-4 py-2 text-foreground"
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
            className="mt-4 rounded-sm bg-selfprimary-500 px-4 py-2 text-selfprimary-50"
          >
            Újratöltés
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {imageRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-2">
              {row.map((image) => (
                <LazyMedia
                  key={image.id}
                  media={image}
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
        <MediaModal
          media={selected}
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

const MediaModal = ({
  media,
  onClose,
  onDownload,
  handleNextImage,
  handlePreviousImage,
}: {
  media: MediaImageType;
  onClose: () => void;
  onDownload: () => Promise<void> | void;
  handleNextImage: () => void;
  handlePreviousImage: () => void;
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [madeByTags, setMadeByTags] = useState<string[]>([]);
  const isImage = (media.media_type ?? "image") === "image";
  const isVideo = !isImage;

  // Fetch madeBy tags for the image
  useEffect(() => {
    if (media.media_type === "video") return;
    const fetchMadeByTags = async () => {
      try {
        const res = await fetch(`/api/media/tags?imageId=${media.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.tags && Array.isArray(data.tags)) {
            const madeBy = data.tags
              .filter(
                (t: MediaTagType) =>
                  t.priority === "madeBy" || t.tag_name.startsWith("Made by:"),
              )
              .map((t: { tag_name: string }) =>
                t.tag_name.replaceAll("Made by:", "").trim(),
              );
            setMadeByTags(madeBy);
          }
        }
      } catch (err) {
        console.error("Error fetching tags:", err);
      }
    };

    fetchMadeByTags();
  }, [media.id, media.media_type]);

  const title = media.original_file_name || "Kép";
  const videoEmbedSrc = getYouTubeEmbedUrl(media.video_url);
  const imageSrc = `/api/media/${media.id}?size=large`;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await onDownload();
    } finally {
      setDownloading(false);
    }
  };

  // Reseteljük a loaded state-et, amikor új képre vált
  useEffect(() => {
    setLoaded(false);
    setError(false);
    setMadeByTags([]);
  }, [media.id]);

  // Fullscreen overlay mode
  if (isFullscreen) {
    return (
      <div className="z-60 fixed inset-0 flex items-center justify-center bg-black p-4">
        <button
          type="button"
          aria-label="Kilépés"
          className="absolute inset-0"
          onClick={() => setIsFullscreen(false)}
        />
        {!loaded && !error && (
          <div className="z-10 p-8 text-sm text-foreground-600">Betöltés…</div>
        )}
        {error && (
          <div className="z-10 p-8 text-sm text-danger-600">
            Hiba a betöltésekor
          </div>
        )}
        {isVideo && videoEmbedSrc ? (
          <iframe
            src={videoEmbedSrc}
            className={`z-10 aspect-video w-full max-w-[96vw] ${loaded ? "" : "hidden"}`}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title}
          ></iframe>
        ) : (
          <img
            src={imageSrc}
            alt={title}
            className={`z-10 max-h-[92vh] w-auto max-w-[96vw] object-contain ${
              loaded ? "" : "hidden"
            }`}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNextImage();
          }}
          className="absolute right-4 z-10 h-12 w-12 self-center rounded-full bg-foreground-300 text-center text-2xl opacity-70 hover:opacity-100"
        >
          ➜
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePreviousImage();
          }}
          className="absolute left-4 z-10 h-12 w-12 rotate-180 self-center rounded-full bg-foreground-300 text-center text-2xl opacity-70 hover:opacity-100"
        >
          ➜
        </button>

        <div className="absolute right-4 top-4 z-20 flex gap-2">
          {isImage && (
            <button
              className="rounded-sm bg-selfprimary-600 px-3 py-2 text-sm text-foreground-50 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              disabled={downloading}
            >
              {downloading ? "Letöltés..." : "Letöltés"}
            </button>
          )}
          <button
            className="rounded-sm bg-selfprimary-600 px-3 py-2 text-sm text-foreground-50"
            onClick={() => setIsFullscreen(true)}
          >
            Fullscreen
          </button>
          <button
            className="rounded-sm bg-selfsecondary-600 px-3 py-2 text-sm text-foreground-50"
            onClick={onClose}
          >
            Kilépés
          </button>
        </div>

        {/* Made By Tags - Fullscreen */}
        {isImage && madeByTags.length > 0 && (
          <div className="absolute bottom-4 right-4 rounded-lg bg-black/70 px-3 py-2">
            <div className="flex items-center gap-2 text-sm text-white">
              <p>Készítette:</p>
              <p className="font-semibold">{madeByTags.join(", ")}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Bezárás"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      <div className="relative z-10 max-h-[90vh] w-full max-w-5xl rounded-xl bg-selfprimary-bg p-3 shadow-2xl">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2
            className="truncate text-lg font-semibold text-selfprimary-800"
            title={title}
          >
            {title}
          </h2>
          <div className="flex gap-2">
            {isImage && (
              <button
                className="rounded-sm bg-selfprimary-500 px-3 py-2 text-sm text-foreground-50 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? "Letöltés..." : "Letöltés"}
              </button>
            )}
            <button
              className="rounded-sm bg-selfprimary-500 px-3 py-2 text-sm text-foreground-50"
              onClick={() => setIsFullscreen(true)}
            >
              Fullscreen
            </button>
            <button
              className="rounded-sm bg-selfsecondary-600 px-3 py-2 text-sm text-foreground-50"
              onClick={onClose}
            >
              Bezárás
            </button>
          </div>
        </div>

        <div
          className="relative flex max-h-[80vh] items-center justify-center overflow-auto rounded-lg border"
          style={{ backgroundColor: media.color ?? "#f3f4f6" }}
        >
          {!loaded && !error && (
            <div className="p-8 text-sm text-foreground-600">Betöltés…</div>
          )}
          {error && (
            <div className="p-8 text-sm text-danger-600">
              Hiba a betöltésekor
            </div>
          )}
          {isVideo && videoEmbedSrc ? (
            <iframe
              src={videoEmbedSrc}
              className={`aspect-video w-full ${loaded ? "" : "hidden"}`}
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title}
            ></iframe>
          ) : (
            <img
              src={imageSrc}
              alt={title}
              className={`max-h-[80vh] w-auto max-w-full object-contain ${
                loaded ? "" : "hidden"
              }`}
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
            />
          )}
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

          {/* Made By Tags */}
          {isImage && madeByTags.length > 0 && (
            <div className="absolute bottom-2 right-2 rounded-lg bg-black/70 px-2 py-1">
              <div className="flex items-center gap-2 text-xs text-white">
                <p>Készítette:</p>
                <p className="font-semibold">{madeByTags.join(", ")}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoGrid;
