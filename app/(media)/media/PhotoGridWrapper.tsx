"use client";
import { MediaTagType } from "@/db/mediaTags";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const PhotoGrid = dynamic(() => import("./PhotoGrid"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div>Galéria betöltése...</div>
    </div>
  ),
});

const PhotoGridWrapper = () => {
  const [availableTags, setAvailableTags] = useState<MediaTagType[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);
  const [matchAll, setMatchAll] = useState(false); // false = VAGY, true = ÉS

  useEffect(() => {
    fetch("/api/getAllTags", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        module: "mediaTags",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAvailableTags(data);
        }
      })
      .catch((err) => {
        console.error("Error fetching tags:", err);
      });
  }, []);

  const filteredTags = availableTags.filter((tag) =>
    tag.tag_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName],
    );
  };

  const clearAllTags = () => {
    setSelectedTags([]);
    setSearchQuery("");
  };

  return (
    <div className="py-8">
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsTagMenuOpen(!isTagMenuOpen)}
            className="flex items-center gap-2 rounded-lg bg-selfprimary-100 px-4 py-2 text-selfprimary-700 transition hover:bg-selfprimary-200"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Szűrés tag alapján
            {selectedTags.length > 0 && (
              <span className="ml-1 rounded-full bg-selfprimary-600 px-2 py-0.5 text-xs text-white">
                {selectedTags.length}
              </span>
            )}
          </button>

          {selectedTags.length > 1 && (
            <div className="flex items-center gap-1 rounded-lg bg-foreground-100 p-1">
              <button
                onClick={() => setMatchAll(false)}
                className={`rounded-md px-3 py-1 text-sm transition ${
                  !matchAll
                    ? "bg-selfprimary-600 text-white"
                    : "text-foreground-600 hover:bg-foreground-200"
                }`}
              >
                VAGY
              </button>
              <button
                onClick={() => setMatchAll(true)}
                className={`rounded-md px-3 py-1 text-sm transition ${
                  matchAll
                    ? "bg-selfprimary-600 text-white"
                    : "text-foreground-600 hover:bg-foreground-200"
                }`}
              >
                ÉS
              </button>
            </div>
          )}

          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full bg-selfprimary-600 px-3 py-1 text-sm text-white"
            >
              {tag}
              <button
                onClick={() => toggleTag(tag)}
                className="ml-1 rounded-full hover:bg-selfprimary-700"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </span>
          ))}

          {selectedTags.length > 0 && (
            <button
              onClick={clearAllTags}
              className="text-sm text-danger-600 hover:text-danger-700"
            >
              Összes törlése
            </button>
          )}
        </div>

        {isTagMenuOpen && (
          <div className="mt-2 rounded-lg border bg-selfprimary-bg p-4 shadow-lg">
            <input
              type="text"
              placeholder="Tag keresése..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-3 w-full rounded-lg border border-selfprimary-300 bg-transparent px-3 py-2 focus:border-selfprimary-500 focus:outline-none"
            />

            <div className="flex max-h-60 flex-wrap gap-2 overflow-y-auto">
              {filteredTags.length === 0 ? (
                <p className="text-sm text-foreground-500">
                  {searchQuery ? "Nincs találat" : "Nincsenek elérhető tagek"}
                </p>
              ) : (
                filteredTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.tag_name)}
                    className={`rounded-full px-3 py-1 text-sm transition ${
                      selectedTags.includes(tag.tag_name)
                        ? "bg-selfprimary-600 text-white"
                        : "bg-selfprimary-100 text-selfprimary-700 hover:bg-selfprimary-200"
                    }`}
                  >
                    {tag.tag_name}
                  </button>
                ))
              )}
            </div>

            <button
              onClick={() => setIsTagMenuOpen(false)}
              className="mt-3 text-sm text-foreground-500 hover:text-foreground-700"
            >
              Bezárás
            </button>
          </div>
        )}
      </div>

      <PhotoGrid filterTags={selectedTags} matchAll={matchAll} />
    </div>
  );
};

export default PhotoGridWrapper;
