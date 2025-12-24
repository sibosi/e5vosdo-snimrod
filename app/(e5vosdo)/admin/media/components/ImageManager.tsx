"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Select, SelectItem } from "@heroui/select";
import { Checkbox } from "@heroui/checkbox";
import { Pagination } from "@heroui/pagination";
import { MediaImageType } from "@/db/mediaPhotos";

interface ImageManagerProps {
  onRefresh?: () => void;
}

const ImageManager: React.FC<ImageManagerProps> = ({ onRefresh }) => {
  const [images, setImages] = useState<MediaImageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<"all" | "with-preview" | "no-preview">(
    "all",
  );
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    mode: "delete" | "reset-previews";
    count: number;
  } | null>(null);

  const ITEMS_PER_PAGE = 50;

  const getStatusColor = (
    type: "success" | "error" | "info",
  ): "success" | "danger" | "primary" => {
    switch (type) {
      case "success":
        return "success";
      case "error":
        return "danger";
      default:
        return "primary";
    }
  };

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/media/images?page=${page}&limit=${ITEMS_PER_PAGE}&filter=${filter}`,
      );
      const data = await res.json();
      if (data.images) {
        setImages(data.images);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      setStatusMessage({ type: "error", text: "Hiba a képek betöltésekor" });
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === images.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(images.map((img) => img.id)));
    }
  };

  const handleAction = (mode: "delete" | "reset-previews") => {
    if (selectedIds.size === 0) return;
    setConfirmDialog({ show: true, mode, count: selectedIds.size });
  };

  const executeAction = async () => {
    if (!confirmDialog) return;

    setActionLoading(true);
    setConfirmDialog(null);

    try {
      const res = await fetch("/api/admin/media/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageIds: Array.from(selectedIds),
          mode: confirmDialog.mode,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatusMessage({ type: "success", text: data.message });
        setSelectedIds(new Set());
        fetchImages();
        onRefresh?.();
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Ismeretlen hiba",
        });
      }
    } catch (error: any) {
      setStatusMessage({
        type: "error",
        text: error.message || "Hálózati hiba",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">🗑️ Képek kezelése</h2>
          <Select
            label="Szűrés"
            size="sm"
            className="w-48"
            selectedKeys={[filter]}
            onChange={(e) => {
              setFilter(e.target.value as typeof filter);
              setPage(1);
              setSelectedIds(new Set());
            }}
          >
            <SelectItem key="all">Összes</SelectItem>
            <SelectItem key="with-preview">Van preview</SelectItem>
            <SelectItem key="no-preview">Nincs preview</SelectItem>
          </Select>
        </CardHeader>
        <CardBody>
          {statusMessage && (
            <Chip
              color={getStatusColor(statusMessage.type)}
              variant="flat"
              className="mb-4"
            >
              {statusMessage.text}
            </Chip>
          )}

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="flat" onPress={toggleSelectAll}>
              {selectedIds.size === images.length && images.length > 0
                ? "Kijelölés törlése"
                : "Mind kijelölése"}
            </Button>

            <Chip variant="flat" size="sm">
              {selectedIds.size} kijelölve
            </Chip>

            <div className="flex-1" />

            <Button
              color="warning"
              size="sm"
              onPress={() => handleAction("reset-previews")}
              isDisabled={selectedIds.size === 0 || actionLoading}
              isLoading={actionLoading}
            >
              🔄 Preview reset ({selectedIds.size})
            </Button>

            <Button
              color="danger"
              size="sm"
              onPress={() => handleAction("delete")}
              isDisabled={selectedIds.size === 0 || actionLoading}
              isLoading={actionLoading}
            >
              🗑️ Törlés ({selectedIds.size})
            </Button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          )}

          {!loading && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-default-100">
                  <tr>
                    <th className="w-10 px-2 py-2">
                      <Checkbox
                        isSelected={
                          selectedIds.size === images.length &&
                          images.length > 0
                        }
                        onValueChange={toggleSelectAll}
                        size="sm"
                      />
                    </th>
                    <th className="px-3 py-2 text-left">ID</th>
                    <th className="px-3 py-2 text-left">Fájlnév</th>
                    <th className="px-3 py-2 text-left">Preview</th>
                    <th className="px-3 py-2 text-left">Szín</th>
                    <th className="px-3 py-2 text-left">Small</th>
                    <th className="px-3 py-2 text-left">Large</th>
                  </tr>
                </thead>
                <tbody>
                  {images.map((img) => (
                    <tr
                      key={img.id}
                      className={`cursor-pointer border-t border-default-200 transition-colors hover:bg-default-100 ${
                        selectedIds.has(img.id) ? "bg-primary-50" : ""
                      }`}
                      onClick={() => toggleSelect(img.id)}
                    >
                      <td className="px-2 py-2 text-center">
                        <Checkbox
                          isSelected={selectedIds.has(img.id)}
                          onValueChange={() => toggleSelect(img.id)}
                          onClick={(e) => e.stopPropagation()}
                          size="sm"
                        />
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">{img.id}</td>
                      <td className="px-3 py-2 font-mono text-xs">
                        {img.original_file_name}
                      </td>
                      <td className="px-3 py-2">
                        {img.small_preview_drive_id && (
                          <img
                            src={`/api/media/${img.id}?size=small`}
                            alt={`#${img.id}`}
                            className="h-10 w-10 rounded object-cover"
                          />
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {img.color && (
                          <div
                            className="h-5 w-5 rounded border border-default-300"
                            style={{ backgroundColor: img.color }}
                            title={img.color}
                          />
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {img.small_preview_drive_id ? (
                          <Chip color="success" size="sm" variant="flat">
                            ✓
                          </Chip>
                        ) : (
                          <span className="text-default-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {img.large_preview_drive_id ? (
                          <Chip color="success" size="sm" variant="flat">
                            ✓
                          </Chip>
                        ) : (
                          <span className="text-default-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty state */}
          {!loading && images.length === 0 && (
            <p className="py-8 text-center text-default-500">
              Nincs találat a szűrési feltételeknek megfelelően.
            </p>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-4">
              <Pagination
                total={totalPages}
                page={page}
                onChange={setPage}
                showControls
              />
              <span className="text-sm text-default-500">({total} kép)</span>
            </div>
          )}
        </CardBody>
      </Card>

      <Modal
        isOpen={confirmDialog?.show ?? false}
        onClose={() => setConfirmDialog(null)}
      >
        <ModalContent>
          <ModalHeader>
            {confirmDialog?.mode === "delete"
              ? "🗑️ Képek törlése"
              : "🔄 Preview-k resetelése"}
          </ModalHeader>
          <ModalBody>
            {confirmDialog?.mode === "delete" ? (
              <p>
                Biztosan törölni szeretnéd ezt a(z){" "}
                <strong>{confirmDialog?.count}</strong> képet? Ez a művelet{" "}
                <strong>nem vonható vissza!</strong>
                <br />
                <br />
                <span className="text-sm text-default-500">
                  Megjegyzés: A Drive-ból manuálisan kell törölni a fájlokat.
                </span>
              </p>
            ) : (
              <p>
                Biztosan resetelni szeretnéd{" "}
                <strong>{confirmDialog?.count}</strong> kép preview-it? Az
                eredeti képek megmaradnak, csak a preview-k törlődnek.
                <br />
                <br />
                <span className="text-sm text-default-500">
                  A preview-k újra lesznek generálva a következő betöltéskor.
                </span>
              </p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setConfirmDialog(null)}>
              Mégse
            </Button>
            <Button
              color={confirmDialog?.mode === "delete" ? "danger" : "warning"}
              onPress={executeAction}
            >
              {confirmDialog?.mode === "delete" ? "Törlés" : "Preview reset"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ImageManager;
