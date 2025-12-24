"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Progress } from "@heroui/progress";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Tabs, Tab } from "@heroui/tabs";
import TagManager from "./components/TagManager";
import ImageTagger from "./components/ImageTagger";
import ImageManager from "./components/ImageManager";
import XMLImporter from "./components/XMLImporter";
import DriveXmlImporter from "./components/DriveXmlImporter";
import type { OperationType } from "@/lib/globalProgress";

// Local UI-specific progress state - standalone interface (not extending GlobalProgressState)
interface ProgressState {
  running: boolean;
  current: number;
  total: number;
  currentFile: string;
  phase: string;
  operationType: OperationType | null;
  options?: Record<string, any>;
  stats?: Record<string, number>;
  errors: string[];
  startedAt: string | null; // Serialized as string when fetched from API
  size?: "small" | "large";
}

interface Stats {
  database: {
    total: number;
    withColor: number;
    withoutColor: number;
    withDatetime: number;
    withoutDatetime: number;
    withSmallPreview: number;
    withLargePreview: number;
  };
  localCache: {
    smallCount: number;
    largeCount: number;
    totalSizeBytes: number;
  };
}

interface TagStats {
  tag_id: number;
  tag_name: string;
  usage_count: number;
  priority: "madeBy" | "normal" | "high";
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
}

function ProgressCard({
  title,
  progress,
  onStart,
  startLabel,
  startDisabled,
  children,
}: Readonly<{
  title: string;
  progress: ProgressState | null;
  onStart: () => void;
  startLabel: string;
  startDisabled?: boolean;
  children?: React.ReactNode;
}>) {
  const isRunning = progress?.running ?? false;
  const percentage =
    progress && progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <Card className="mb-4">
      <CardHeader className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        {isRunning && (
          <Chip color="warning" variant="flat">
            Fut...
          </Chip>
        )}
      </CardHeader>
      <CardBody>
        {children}

        {progress && (
          <div className="mt-4">
            {isRunning && (
              <>
                <Progress
                  aria-label="Progress"
                  value={percentage}
                  className="mb-2"
                  color="primary"
                />
                <p className="text-sm text-default-500">
                  {progress.current} / {progress.total} ({percentage}%)
                </p>
                <p className="truncate text-sm text-default-400">
                  {progress.currentFile}
                </p>
              </>
            )}

            {!isRunning && progress.current > 0 && (
              <p className="text-sm text-success">
                ✓ Kész: {progress.current} / {progress.total}
              </p>
            )}

            {progress.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-danger">
                  Hibák: {progress.errors.length}
                </p>
                <details className="mt-1 text-xs text-default-400">
                  <summary className="cursor-pointer">Részletek</summary>
                  <ul className="max-h-32 list-inside list-disc overflow-y-auto">
                    {progress.errors.slice(0, 20).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {progress.errors.length > 20 && (
                      <li>...és még {progress.errors.length - 20} hiba</li>
                    )}
                  </ul>
                </details>
              </div>
            )}
          </div>
        )}

        <Button
          color="primary"
          className="mt-4"
          onPress={onStart}
          isDisabled={isRunning || startDisabled}
          isLoading={isRunning}
        >
          {startLabel}
        </Button>
      </CardBody>
    </Card>
  );
}

type TabKey =
  | "sync"
  | "images"
  | "manage"
  | "tags"
  | "xml-upload"
  | "xml-drive";

export default function MediaAdminClient() {
  const [activeTab, setActiveTab] = useState<TabKey>("sync");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tags for ImageTagger
  const [tags, setTags] = useState<TagStats[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);

  // Centralized progress state - single source of truth
  const [progress, setProgress] = useState<ProgressState | null>(null);

  // Cache of last completed operation states (for showing "Kész" after completion)
  const [completedOperations, setCompletedOperations] = useState<
    Partial<Record<OperationType, ProgressState>>
  >({});

  // Track if we're currently polling to avoid duplicate fetches
  const isPollingRef = useRef(false);

  // Size selection for cache operations
  const [selectedSize, setSelectedSize] = useState<"small" | "large">("small");

  // Helper to get progress for a specific operation type
  const getOperationProgress = useCallback(
    (type: OperationType): ProgressState | null => {
      // If current operation matches, return it
      if (progress?.operationType === type) {
        return progress;
      }
      // Otherwise return cached completed state
      return completedOperations[type] || null;
    },
    [progress, completedOperations],
  );

  // Derived progress states for each operation
  const syncProgress = getOperationProgress("sync");
  const colorProgress = getOperationProgress("generate-colors");
  const exifProgress = getOperationProgress("extract-exif");
  const driveCacheProgress = getOperationProgress("cache-drive");
  const localCacheProgress = getOperationProgress("cache-local");
  const batchProgress = getOperationProgress("batch");

  // Fetch tags
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

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/media");
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll progress for running operations - centralized
  const pollProgress = useCallback(async () => {
    // Prevent concurrent polling
    if (isPollingRef.current) return;
    isPollingRef.current = true;

    try {
      const res = await fetch("/api/admin/media/progress");
      if (res.ok) {
        const data: ProgressState = await res.json();

        // Update the central progress state
        setProgress(data);

        // If operation just completed (not running but has operationType), cache it
        if (!data.running && data.operationType) {
          setCompletedOperations((prev) => ({
            ...prev,
            [data.operationType!]: data,
          }));
        }
      }
    } catch {
      // Ignore polling errors
    } finally {
      isPollingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchTags();
    pollProgress();

    // Poll every 2 seconds
    const interval = setInterval(() => {
      pollProgress();
      // Refresh stats if any operation is running
      if (progress?.running) {
        fetchStats();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchStats, fetchTags, pollProgress, progress?.running]);

  // Action handlers
  const startSync = async (withColors: boolean) => {
    try {
      await fetch("/api/admin/media/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withColors }),
      });
      pollProgress();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startColorGeneration = async () => {
    try {
      await fetch("/api/admin/media/generate-colors", {
        method: "POST",
      });
      pollProgress();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startExifExtraction = async (forceAll: boolean = false) => {
    try {
      await fetch("/api/admin/media/extract-exif", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceAll }),
      });
      pollProgress();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startDriveCache = async (size: "small" | "large") => {
    try {
      await fetch("/api/admin/media/cache-drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ size }),
      });
      pollProgress();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startLocalCache = async (size: "small" | "large") => {
    try {
      await fetch("/api/admin/media/cache-local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ size }),
      });
      pollProgress();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startBatch = async (options: {
    syncNew: boolean;
    generateColors: boolean;
    driveCache: boolean;
    localCache: boolean;
  }) => {
    try {
      await fetch("/api/admin/media/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...options,
          sizes: ["small", "large"],
        }),
      });
      pollProgress();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Média Admin</h1>
        <a
          href="/media"
          className="rounded bg-default-200 px-4 py-2 text-default-700 hover:bg-default-300"
        >
          ← Vissza a galériához
        </a>
      </div>

      {error && (
        <Card className="mb-4 bg-danger-50">
          <CardBody>
            <p className="text-danger">{error}</p>
          </CardBody>
        </Card>
      )}

      {/* Tab Navigation */}
      <Tabs
        aria-label="Admin tabs"
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as TabKey)}
        className="mb-6"
      >
        <Tab key="sync" title="⚡ Szinkronizálás" />
        <Tab key="images" title="📷 Képek címkézése" />
        <Tab key="manage" title="🗑️ Képek kezelése" />
        <Tab key="tags" title="🏷️ Címkék kezelése" />
        <Tab key="xml-drive" title="📁 XML Import (Drive)" />
        <Tab key="xml-upload" title="📥 XML Import (Feltöltés)" />
      </Tabs>

      {/* Tab Content */}
      <div className="rounded-lg border border-default-200 bg-content1 p-4 shadow-sm">
        {/* Sync Tab */}
        {activeTab === "sync" && (
          <div>
            {/* Statistics */}
            {stats && (
              <Card className="mb-6">
                <CardHeader>
                  <h2 className="text-lg font-semibold">Statisztikák</h2>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm text-default-500">Összes kép</p>
                      <p className="text-2xl font-bold">
                        {stats.database.total}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Színnel</p>
                      <p className="text-2xl font-bold text-success">
                        {stats.database.withColor}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">
                        Drive kis preview
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {stats.database.withSmallPreview}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">
                        Drive nagy preview
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {stats.database.withLargePreview}
                      </p>
                    </div>
                  </div>

                  <Divider className="my-4" />

                  <h3 className="text-md mb-2 font-semibold">Lokális cache</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-default-500">Kis preview-k</p>
                      <p className="text-xl font-bold">
                        {stats.localCache.smallCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Nagy preview-k</p>
                      <p className="text-xl font-bold">
                        {stats.localCache.largeCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Méret</p>
                      <p className="text-xl font-bold">
                        {formatBytes(stats.localCache.totalSizeBytes)}
                      </p>
                    </div>
                  </div>

                  <Button
                    color="default"
                    variant="flat"
                    size="sm"
                    className="mt-4"
                    onPress={fetchStats}
                  >
                    Frissítés
                  </Button>
                </CardBody>
              </Card>
            )}

            {/* Batch Operations */}
            <Card className="mb-6 border-2 border-primary">
              <CardHeader className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  ⚡ Összevont műveletek
                </h2>
                {batchProgress?.running && (
                  <Chip color="warning" variant="flat">
                    {batchProgress.phase || "Fut..."}
                  </Chip>
                )}
              </CardHeader>
              <CardBody>
                <p className="mb-4 text-sm text-default-500">
                  Hatékonyabb feldolgozás: egy kép letöltésével több művelet is
                  elvégezhető egyszerre.
                </p>

                {batchProgress?.running && (
                  <div className="mb-4">
                    <Progress
                      aria-label="Batch progress"
                      value={
                        batchProgress.total > 0
                          ? Math.round(
                              (batchProgress.current / batchProgress.total) *
                                100,
                            )
                          : 0
                      }
                      className="mb-2"
                      color="primary"
                    />
                    <p className="text-sm text-default-500">
                      {batchProgress.current} / {batchProgress.total}
                    </p>
                    <p className="truncate text-sm text-default-400">
                      {batchProgress.currentFile}
                    </p>
                    {batchProgress.stats && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Chip size="sm" variant="flat">
                          Sync: {batchProgress.stats.synced}
                        </Chip>
                        <Chip size="sm" variant="flat" color="success">
                          Színek: {batchProgress.stats.colorsGenerated}
                        </Chip>
                        <Chip size="sm" variant="flat" color="primary">
                          Drive: {batchProgress.stats.driveCached}
                        </Chip>
                        <Chip size="sm" variant="flat" color="secondary">
                          Local: {batchProgress.stats.localCached}
                        </Chip>
                      </div>
                    )}
                  </div>
                )}

                {!batchProgress?.running && batchProgress?.stats && (
                  <div className="mb-4 rounded-lg bg-success-50 p-3">
                    <p className="text-sm font-semibold text-success">
                      ✓ Kész!
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Chip size="sm" variant="flat">
                        Sync: {batchProgress.stats.synced}
                      </Chip>
                      <Chip size="sm" variant="flat" color="success">
                        Színek: {batchProgress.stats.colorsGenerated}
                      </Chip>
                      <Chip size="sm" variant="flat" color="primary">
                        Drive: {batchProgress.stats.driveCached}
                      </Chip>
                      <Chip size="sm" variant="flat" color="secondary">
                        Local: {batchProgress.stats.localCached}
                      </Chip>
                    </div>
                  </div>
                )}

                {batchProgress?.errors && batchProgress.errors.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-danger">
                      Hibák: {batchProgress.errors.length}
                    </p>
                    <details className="mt-1 text-xs text-default-400">
                      <summary className="cursor-pointer">Részletek</summary>
                      <ul className="max-h-32 list-inside list-disc overflow-y-auto">
                        {batchProgress.errors.slice(0, 20).map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                        {batchProgress.errors.length > 20 && (
                          <li>
                            ...és még {batchProgress.errors.length - 20} hiba
                          </li>
                        )}
                      </ul>
                    </details>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    color="primary"
                    onPress={() =>
                      startBatch({
                        syncNew: true,
                        generateColors: true,
                        driveCache: true,
                        localCache: true,
                      })
                    }
                    isDisabled={batchProgress?.running}
                    isLoading={batchProgress?.running}
                  >
                    🚀 Minden (teljes feldolgozás)
                  </Button>
                  <Button
                    color="secondary"
                    variant="flat"
                    onPress={() =>
                      startBatch({
                        syncNew: true,
                        generateColors: true,
                        driveCache: true,
                        localCache: false,
                      })
                    }
                    isDisabled={batchProgress?.running}
                  >
                    ☁️ Minden (local cache nélkül)
                  </Button>
                  <Button
                    color="default"
                    variant="flat"
                    onPress={() =>
                      startBatch({
                        syncNew: true,
                        generateColors: true,
                        driveCache: false,
                        localCache: false,
                      })
                    }
                    isDisabled={batchProgress?.running}
                  >
                    📥 Csak sync + színek
                  </Button>
                </div>
              </CardBody>
            </Card>

            <Divider className="my-6" />
            <h2 className="mb-4 text-lg font-semibold text-default-500">
              Egyedi műveletek
            </h2>

            {/* Sync from Drive */}
            <ProgressCard
              title="1. Drive szinkronizálás"
              progress={syncProgress}
              onStart={() => startSync(true)}
              startLabel="Szinkronizálás + színek"
            >
              <p className="text-sm text-default-500">
                Új képek felvétele a Drive mappából az adatbázisba, domináns
                szín számítással.
              </p>
              <Button
                color="default"
                variant="flat"
                size="sm"
                className="mt-2"
                onPress={() => startSync(false)}
                isDisabled={syncProgress?.running}
              >
                Csak szinkronizálás (szín nélkül)
              </Button>
            </ProgressCard>

            {/* Generate colors */}
            <ProgressCard
              title="2. Színek generálása"
              progress={colorProgress}
              onStart={startColorGeneration}
              startLabel="Színek generálása"
              startDisabled={stats?.database.withoutColor === 0}
            >
              <p className="text-sm text-default-500">
                Domináns szín számítása azoknál a képeknél, ahol még nincs.
                {stats && stats.database.withoutColor > 0 && (
                  <span className="ml-1 text-warning">
                    ({stats.database.withoutColor} kép szín nélkül)
                  </span>
                )}
              </p>
            </ProgressCard>

            {/* Extract EXIF datetime */}
            <ProgressCard
              title="2b. EXIF dátum kinyerése"
              progress={exifProgress}
              onStart={() => startExifExtraction(false)}
              startLabel="Hiányzó dátumok kinyerése"
            >
              <p className="text-sm text-default-500">
                Kép készítésének időpontja (EXIF) kinyerése azoknál a képeknél,
                ahol még nincs.
              </p>
              {(exifProgress as any)?.stats && (
                <div className="mt-2 text-xs text-default-400">
                  Kinyerve: {(exifProgress as any).stats.extracted} | Nincs
                  EXIF: {(exifProgress as any).stats.noExif}
                </div>
              )}
              <Button
                color="default"
                variant="flat"
                size="sm"
                className="mt-2"
                onPress={() => startExifExtraction(true)}
                isDisabled={exifProgress?.running}
              >
                Minden kép újrafeldolgozása
              </Button>
            </ProgressCard>

            {/* Drive cache */}
            <ProgressCard
              title="3. Drive cache (backup)"
              progress={driveCacheProgress}
              onStart={() => startDriveCache(selectedSize)}
              startLabel={`${selectedSize === "small" ? "Kis" : "Nagy"} preview-k feltöltése`}
            >
              <p className="text-sm text-default-500">
                Preview képek feltöltése a Drive-ra backup-ként.
              </p>
              <div className="mt-2 flex gap-2">
                <Button
                  color={selectedSize === "small" ? "primary" : "default"}
                  variant={selectedSize === "small" ? "solid" : "flat"}
                  size="sm"
                  onPress={() => setSelectedSize("small")}
                >
                  Kis (200px)
                </Button>
                <Button
                  color={selectedSize === "large" ? "primary" : "default"}
                  variant={selectedSize === "large" ? "solid" : "flat"}
                  size="sm"
                  onPress={() => setSelectedSize("large")}
                >
                  Nagy (1200px)
                </Button>
              </div>
            </ProgressCard>

            {/* Local cache */}
            <ProgressCard
              title="4. Lokális cache"
              progress={localCacheProgress}
              onStart={() => startLocalCache(selectedSize)}
              startLabel={`${selectedSize === "small" ? "Kis" : "Nagy"} preview-k cache-elése`}
            >
              <p className="text-sm text-default-500">
                Preview képek előgenerálása és mentése a szerver lokális
                fájlrendszerébe.
              </p>
              <div className="mt-2 flex gap-2">
                <Button
                  color={selectedSize === "small" ? "primary" : "default"}
                  variant={selectedSize === "small" ? "solid" : "flat"}
                  size="sm"
                  onPress={() => setSelectedSize("small")}
                >
                  Kis (200px)
                </Button>
                <Button
                  color={selectedSize === "large" ? "primary" : "default"}
                  variant={selectedSize === "large" ? "solid" : "flat"}
                  size="sm"
                  onPress={() => setSelectedSize("large")}
                >
                  Nagy (1200px)
                </Button>
              </div>
            </ProgressCard>
          </div>
        )}

        {/* Images Tab */}
        {activeTab === "images" && (
          <ImageTagger tags={tags} onTagsChange={fetchTags} />
        )}

        {/* Manage Tab */}
        {activeTab === "manage" && <ImageManager onRefresh={fetchStats} />}

        {/* Tags Tab */}
        {activeTab === "tags" && (
          <TagManager
            tags={tags}
            loading={tagsLoading}
            onTagsChange={fetchTags}
          />
        )}

        {/* XML Drive Import Tab */}
        {activeTab === "xml-drive" && (
          <DriveXmlImporter onImportComplete={fetchTags} />
        )}

        {/* XML Upload Import Tab */}
        {activeTab === "xml-upload" && (
          <XMLImporter onImportComplete={fetchTags} />
        )}
      </div>
    </div>
  );
}
