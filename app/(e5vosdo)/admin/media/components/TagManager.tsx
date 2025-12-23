"use client";

import React, { useState, useRef } from "react";

interface TagStats {
  tag_id: number;
  tag_name: string;
  usage_count: number;
  priority: "madeBy" | "normal" | "high";
}

interface TagManagerProps {
  tags: TagStats[];
  loading: boolean;
  onTagsChange: () => void;
}

const TagManager: React.FC<TagManagerProps> = ({
  tags,
  loading,
  onTagsChange,
}) => {
  const [newTagName, setNewTagName] = useState("");
  const [editingTag, setEditingTag] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filteredTags = tags.filter((tag) =>
    tag.tag_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/media/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag_name: newTagName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create tag");
      }

      setNewTagName("");
      onTagsChange();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTag = async () => {
    if (!editingTag?.name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/media/tags", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingTag.id,
          tag_name: editingTag.name.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update tag");
      }

      setEditingTag(null);
      onTagsChange();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTag = async (tagId: number, tagName: string) => {
    if (
      !confirm(
        `Biztosan törölni szeretnéd a "${tagName}" címkét? Ez minden képről eltávolítja.`,
      )
    )
      return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/media/tags", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tagId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete tag");
      }

      onTagsChange();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePriority = async (
    tagId: number,
    priority: "madeBy" | "normal" | "high",
  ) => {
    setError(null);
    const scrollTop = scrollContainerRef.current?.scrollTop ?? 0;

    try {
      const res = await fetch("/api/admin/media/tags", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tagId, priority }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update priority");
      }

      await onTagsChange();
      // Restore scroll position after data refresh
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollTop;
        }
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-selfprimary-600 border-t-transparent" />
        <span className="ml-2">Címkék betöltése...</span>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Címkék kezelése</h2>

      {error && (
        <div className="mb-4 rounded-lg bg-danger-100 p-3 text-danger-700">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-danger-900 underline"
          >
            Bezárás
          </button>
        </div>
      )}

      {/* New Tag Form */}
      <form onSubmit={handleCreateTag} className="mb-6 flex gap-2">
        <input
          type="text"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="Új címke neve..."
          className="flex-1 rounded-lg border px-4 py-2 focus:border-selfprimary-500 focus:outline-none"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting || !newTagName.trim()}
          className="rounded-lg bg-selfprimary-600 px-6 py-2 text-foreground hover:bg-selfprimary-700 disabled:opacity-50"
        >
          {isSubmitting ? "..." : "Hozzáadás"}
        </button>
      </form>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Címke keresése..."
          className="w-full rounded-lg border px-4 py-2 focus:border-selfprimary-500 focus:outline-none"
        />
      </div>

      {/* Tags List */}
      <div ref={scrollContainerRef} className="max-h-96 overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-foreground-100">
            <tr>
              <th className="px-4 py-2 text-left">Címke</th>
              <th className="px-4 py-2 text-center">Prioritás</th>
              <th className="px-4 py-2 text-center">Használat</th>
              <th className="px-4 py-2 text-right">Műveletek</th>
            </tr>
          </thead>
          <tbody>
            {filteredTags.map((tag) => (
              <tr key={tag.tag_id} className="border-b hover:bg-foreground-50">
                <td className="px-4 py-2">
                  {editingTag?.id === tag.tag_id ? (
                    <input
                      type="text"
                      value={editingTag.name}
                      onChange={(e) =>
                        setEditingTag({ ...editingTag, name: e.target.value })
                      }
                      className="w-full rounded border px-2 py-1"
                      autoFocus
                    />
                  ) : (
                    <span className="font-medium">{tag.tag_name}</span>
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  <select
                    value={tag.priority}
                    onChange={(e) =>
                      handleUpdatePriority(
                        tag.tag_id,
                        e.target.value as "madeBy" | "normal" | "high",
                      )
                    }
                    className={`rounded border px-2 py-1 text-sm focus:border-selfprimary-500 focus:outline-none ${
                      tag.priority === "madeBy"
                        ? "border-purple-400 bg-purple-100 text-purple-800"
                        : tag.priority === "high"
                          ? "border-green-400 bg-green-100 text-green-800"
                          : "border-foreground-300 bg-foreground-100"
                    }`}
                  >
                    <option value="normal">Normal</option>
                    <option value="high">Kiemelt</option>
                    <option value="madeBy">Készítő</option>
                  </select>
                </td>
                <td className="px-4 py-2 text-center">
                  <span className="rounded-full bg-foreground-200 px-2 py-1 text-sm">
                    {tag.usage_count} kép
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  {editingTag?.id === tag.tag_id ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleUpdateTag}
                        disabled={isSubmitting}
                        className="rounded bg-success-600 px-3 py-1 text-sm text-foreground hover:bg-success-700"
                      >
                        Mentés
                      </button>
                      <button
                        onClick={() => setEditingTag(null)}
                        className="rounded bg-foreground-500 px-3 py-1 text-sm text-foreground hover:bg-foreground-600"
                      >
                        Mégse
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          setEditingTag({ id: tag.tag_id, name: tag.tag_name })
                        }
                        className="rounded bg-warning-500 px-3 py-1 text-sm text-foreground hover:bg-warning-600"
                      >
                        Szerkesztés
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteTag(tag.tag_id, tag.tag_name)
                        }
                        disabled={isSubmitting}
                        className="rounded bg-danger-600 px-3 py-1 text-sm text-foreground hover:bg-danger-700"
                      >
                        Törlés
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTags.length === 0 && (
          <div className="p-8 text-center text-foreground-500">
            {searchQuery
              ? "Nincs találat a keresésre."
              : "Még nincsenek címkék. Adj hozzá egyet fent!"}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-4 text-sm text-foreground-500">
        Összesen {tags.length} címke
        {searchQuery && ` (${filteredTags.length} találat)`}
      </div>
    </div>
  );
};

export default TagManager;
