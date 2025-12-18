"use client";

import React, { useState, useEffect, useCallback } from "react";
import TagManager from "./TagManager";
import ImageTagger from "./ImageTagger";
import XMLImporter from "./XMLImporter";

type Tab = "tags" | "images" | "import";

interface TagStats {
  tag_id: number;
  tag_name: string;
  usage_count: number;
}

const MediaAdminPanel = () => {
  const [activeTab, setActiveTab] = useState<Tab>("images");
  const [tags, setTags] = useState<TagStats[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);

  const fetchTags = useCallback(async () => {
    setTagsLoading(true);
    try {
      const res = await fetch("/api/admin/media/tags?stats=true");
      const data = await res.json();
      if (data.tags) {
        setTags(data.tags);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      setTagsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const tabClass = (tab: Tab) =>
    `px-4 py-2 rounded-t-lg font-medium transition-colors ${
      activeTab === tab
        ? "bg-selfprimary-600 text-foreground"
        : "bg-foreground-200 text-foreground-700 hover:bg-foreground-300"
    }`;

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Média Admin Panel</h1>
          <a
            href="/media"
            className="rounded bg-foreground-500 px-4 py-2 text-foreground hover:bg-foreground-600"
          >
            ← Vissza a galériához
          </a>
        </div>

        {/* Tab Navigation */}
        <div className="mb-4 flex gap-2">
          <button
            className={tabClass("images")}
            onClick={() => setActiveTab("images")}
          >
            📷 Képek címkézése
          </button>
          <button
            className={tabClass("tags")}
            onClick={() => setActiveTab("tags")}
          >
            🏷️ Címkék kezelése
          </button>
          <button
            className={tabClass("import")}
            onClick={() => setActiveTab("import")}
          >
            📥 XML Import
          </button>
        </div>

        {/* Tab Content */}
        <div className="rounded-lg border border-selfprimary-400 bg-selfprimary-bg p-4 shadow-sm">
          {activeTab === "tags" && (
            <TagManager
              tags={tags}
              loading={tagsLoading}
              onTagsChange={fetchTags}
            />
          )}
          {activeTab === "images" && (
            <ImageTagger tags={tags} onTagsChange={fetchTags} />
          )}
          {activeTab === "import" && (
            <XMLImporter onImportComplete={fetchTags} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaAdminPanel;
