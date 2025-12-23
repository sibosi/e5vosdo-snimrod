"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

interface TagStats {
  tag_id: number;
  tag_name: string;
  usage_count: number;
  priority: "madeBy" | "normal" | "high";
}

interface ImageTag {
  tag_id: number;
  tag_name: string;
  coordinate1_x: number | null;
  coordinate1_y: number | null;
  coordinate2_x: number | null;
  coordinate2_y: number | null;
}

interface ImageWithTags {
  id: number;
  datetime?: string;
  original_file_name?: string;
  color?: string;
  small_preview_width?: number;
  small_preview_height?: number;
  tags: ImageTag[];
}

interface ImageTaggerProps {
  tags: TagStats[];
  onTagsChange: () => void;
}

const IMAGES_PER_PAGE = 20;

const ImageTagger: React.FC<ImageTaggerProps> = ({ tags, onTagsChange }) => {
  const [images, setImages] = useState<ImageWithTags[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [newTagsToAdd, setNewTagsToAdd] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const fetchImages = useCallback(
    async (reset: boolean = true) => {
      if (reset) {
        setLoading(true);
        setImages([]);
      } else {
        setLoadingMore(true);
      }

      try {
        const offset = reset ? 0 : images.length;
        let url = `/api/admin/media/images/tags?limit=${IMAGES_PER_PAGE}&offset=${offset}`;
        if (searchTags.length > 0) {
          url = `/api/admin/media/images/tags?search=${encodeURIComponent(searchTags.join(","))}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (data.images) {
          if (reset) {
            setImages(data.images);
          } else {
            setImages((prev) => [...prev, ...data.images]);
          }
          setTotal(data.total ?? data.images.length);
          setHasMore(data.hasMore ?? false);
        }
      } catch (err) {
        console.error("Error fetching images:", err);
        setError("Nem sikerült betölteni a képeket");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [searchTags, images.length],
  );

  // Initial load
  useEffect(() => {
    fetchImages(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTags]);

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          fetchImages(false);
        }
      },
      { rootMargin: "200px" },
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, loadingMore, fetchImages]);

  const toggleImageSelection = (imageId: number) => {
    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedImages(new Set(images.map((img) => img.id)));
  };

  const deselectAll = () => {
    setSelectedImages(new Set());
  };

  const handleAddSearchTag = () => {
    if (tagInput.trim() && !searchTags.includes(tagInput.trim())) {
      setSearchTags([...searchTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveSearchTag = (tag: string) => {
    setSearchTags(searchTags.filter((t) => t !== tag));
  };

  const handleAddTagToSelection = () => {
    if (newTagInput.trim() && !newTagsToAdd.includes(newTagInput.trim())) {
      setNewTagsToAdd([...newTagsToAdd, newTagInput.trim()]);
      setNewTagInput("");
    }
  };

  const handleRemoveNewTag = (tag: string) => {
    setNewTagsToAdd(newTagsToAdd.filter((t) => t !== tag));
  };

  const handleApplyTags = async () => {
    if (selectedImages.size === 0 || newTagsToAdd.length === 0) {
      setError("Válassz ki képeket és adj hozzá címkéket!");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/admin/media/images/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageIds: Array.from(selectedImages),
          tags: newTagsToAdd.map((tag) => ({ tag_name: tag })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to apply tags");
      }

      const result = await res.json();
      setSuccessMessage(
        `Sikeresen hozzáadva: ${result.success} címke. Sikertelen: ${result.failed}`,
      );
      setNewTagsToAdd([]);
      setSelectedImages(new Set());
      fetchImages(true);
      onTagsChange();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveTagFromImage = async (imageId: number, tagId: number) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/media/images/tags", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId, tagId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove tag");
      }

      fetchImages(true);
      onTagsChange();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Képek címkézése</h2>

      {/* Messages */}
      {error && (
        <div className="mb-4 rounded-lg bg-danger-100 p-3 text-danger-700">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Bezárás
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 rounded-lg bg-success-100 p-3 text-success-700">
          {successMessage}
          <button
            onClick={() => setSuccessMessage(null)}
            className="ml-2 underline"
          >
            Bezárás
          </button>
        </div>
      )}

      {/* Search by Tags */}
      <div className="mb-4 rounded-lg bg-foreground-50 p-4">
        <h3 className="mb-2 font-medium">Keresés címkék alapján</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddSearchTag()}
            placeholder="Címke keresése..."
            className="flex-1 rounded-lg border px-3 py-2"
            list="tag-suggestions"
          />
          <datalist id="tag-suggestions">
            {tags.map((tag) => (
              <option key={tag.tag_id} value={tag.tag_name} />
            ))}
          </datalist>
          <button
            onClick={handleAddSearchTag}
            className="rounded-lg bg-selfprimary-600 px-4 py-2 text-foreground hover:bg-selfprimary-700"
          >
            Hozzáad
          </button>
          <button
            onClick={() => setSearchTags([])}
            className="rounded-lg bg-foreground-500 px-4 py-2 text-foreground hover:bg-foreground-600"
          >
            Törlés
          </button>
        </div>
        {searchTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {searchTags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full bg-selfprimary-100 px-3 py-1 text-sm text-selfprimary-800"
              >
                {tag}
                <button
                  onClick={() => handleRemoveSearchTag(tag)}
                  className="ml-1 text-selfprimary-600 hover:text-selfprimary-800"
                >
                  x
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Tagging */}
      <div className="mb-4 rounded-lg bg-selfprimary-50 p-4">
        <h3 className="mb-2 font-medium">Tömeges címkézés</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTagToSelection()}
            placeholder="Címke hozzáadása..."
            className="flex-1 rounded-lg border px-3 py-2"
            list="tag-suggestions"
          />
          <button
            onClick={handleAddTagToSelection}
            className="rounded-lg bg-success-600 px-4 py-2 text-foreground hover:bg-success-700"
          >
            +
          </button>
        </div>
        {newTagsToAdd.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {newTagsToAdd.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full bg-success-100 px-3 py-1 text-sm text-success-800"
              >
                {tag}
                <button
                  onClick={() => handleRemoveNewTag(tag)}
                  className="ml-1 text-success-600 hover:text-success-800"
                >
                  x
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="mt-3 flex items-center gap-4">
          <span className="text-sm text-foreground-600">
            {selectedImages.size} kép kiválasztva
          </span>
          <button
            onClick={selectAll}
            className="text-sm text-selfprimary-600 hover:underline"
          >
            Mind kijelölése
          </button>
          <button
            onClick={deselectAll}
            className="text-sm text-foreground-600 hover:underline"
          >
            Kijelölés törlése
          </button>
          <button
            onClick={handleApplyTags}
            disabled={
              isSubmitting ||
              selectedImages.size === 0 ||
              newTagsToAdd.length === 0
            }
            className="ml-auto rounded-lg bg-success-600 px-6 py-2 text-foreground hover:bg-success-700 disabled:opacity-50"
          >
            {isSubmitting ? "Folyamatban..." : "Címkék alkalmazása"}
          </button>
        </div>
      </div>

      {/* Images Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-selfprimary-600 border-t-transparent" />
          <span className="ml-2">Képek betöltése...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {images.map((image) => (
            <div
              key={image.id}
              className={`relative cursor-pointer rounded-lg border-2 text-left transition-all ${
                selectedImages.has(image.id)
                  ? "border-selfprimary-500 ring-2 ring-selfprimary-300"
                  : "border-transparent hover:border-foreground-300"
              }`}
            >
              {/* Selection Checkbox */}
              <button
                type="button"
                onClick={() => toggleImageSelection(image.id)}
                className={`absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded border-2 ${
                  selectedImages.has(image.id)
                    ? "border-selfprimary-500 bg-selfprimary-500 text-foreground"
                    : "border-foreground bg-foreground/80"
                }`}
              >
                {selectedImages.has(image.id) && "✓"}
              </button>

              {/* Image */}
              <button
                type="button"
                onClick={() => toggleImageSelection(image.id)}
                className="aspect-square w-full overflow-hidden rounded-lg"
                style={{ backgroundColor: image.color || "#foreground" }}
              >
                <img
                  src={`/api/media/${image.id}?size=small`}
                  alt={image.original_file_name || `Image ${image.id}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>

              {/* Tags */}
              <div className="mt-2 flex flex-wrap gap-1">
                {image.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.tag_id}
                    className="group relative inline-flex items-center rounded bg-foreground-200 px-2 py-0.5 text-xs"
                  >
                    {tag.tag_name}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTagFromImage(image.id, tag.tag_id);
                      }}
                      className="ml-1 hidden text-danger-500 hover:text-danger-700 group-hover:inline"
                    >
                      x
                    </button>
                  </span>
                ))}
                {image.tags.length > 3 && (
                  <span className="rounded bg-foreground-100 px-2 py-0.5 text-xs text-foreground-500">
                    +{image.tags.length - 3}
                  </span>
                )}
              </div>

              {/* File name */}
              <button
                type="button"
                onClick={() => toggleImageSelection(image.id)}
              >
                <p className="mt-1 truncate text-xs text-foreground-500">
                  {image.original_file_name || `ID: ${image.id}`}
                </p>
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && images.length === 0 && (
        <div className="p-8 text-center text-foreground-500">
          {searchTags.length > 0
            ? "Nincs találat a megadott címkékre."
            : "Nincsenek képek a galériában."}
        </div>
      )}

      {/* Load More Trigger */}
      {!loading && hasMore && (
        <div
          ref={loadMoreRef}
          className="flex items-center justify-center py-8"
        >
          {loadingMore ? (
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-selfprimary-600 border-t-transparent" />
              <span className="text-foreground-500">
                További képek betöltése...
              </span>
            </div>
          ) : (
            <span className="text-foreground-400">
              Görgetés a további képekért
            </span>
          )}
        </div>
      )}

      {/* Summary */}
      <div className="mt-4 text-sm text-foreground-500">
        {images.length} / {total} kép betöltve
        {searchTags.length > 0 && ` a szűrésnek megfelelően`}
      </div>
    </div>
  );
};

export default ImageTagger;
