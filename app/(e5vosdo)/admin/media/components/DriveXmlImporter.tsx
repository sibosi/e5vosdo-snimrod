"use client";

import React, { useState, useCallback, useEffect } from "react";

interface DriveXmlFile {
  id: string;
  name: string;
  createdTime: string;
  imported: boolean;
}

interface TagImportPreview {
  tagName: string;
  isPersonTag: boolean;
  coordinates?: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

interface XMLImportPreview {
  driveId: string;
  xmlFileName: string;
  matchedImageId: number | null;
  matchedImageName: string | null;
  tags: TagImportPreview[];
  dateTimeOriginal?: string;
  warnings: string[];
}

interface ImportProgress {
  running: boolean;
  current: number;
  total: number;
  currentFile: string;
  errors: string[];
  imported: number;
  skipped: number;
}

interface DriveXmlImporterProps {
  onImportComplete: () => void;
}

const DriveXmlImporter: React.FC<DriveXmlImporterProps> = ({
  onImportComplete,
}) => {
  const [files, setFiles] = useState<DriveXmlFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [previews, setPreviews] = useState<XMLImportPreview[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(
    null
  );
  const [step, setStep] = useState<"list" | "preview" | "importing" | "done">(
    "list"
  );
  const [summary, setSummary] = useState<{
    total: number;
    imported: number;
    notImported: number;
  } | null>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/media/import-xml-drive");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch XML files");
      }
      const data = await res.json();
      setFiles(data.files || []);
      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Poll progress during import
  useEffect(() => {
    if (step !== "importing") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/media/import-xml-drive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "progress" }),
        });
        if (res.ok) {
          const data = await res.json();
          setImportProgress(data);
          if (!data.running && data.current > 0) {
            setStep("done");
            fetchFiles();
            onImportComplete();
          }
        }
      } catch {
        // Ignore polling errors
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [step, fetchFiles, onImportComplete]);

  const toggleFile = (fileId: string) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const selectAllNotImported = () => {
    const notImported = files.filter((f) => !f.imported).map((f) => f.id);
    setSelectedFiles(new Set(notImported));
  };

  const deselectAll = () => {
    setSelectedFiles(new Set());
  };

  const handlePreview = async () => {
    if (selectedFiles.size === 0) {
      setError("Válassz ki fájlokat az előnézethez!");
      return;
    }

    setPreviewLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/media/import-xml-drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "preview",
          fileIds: Array.from(selectedFiles),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Preview failed");
      }

      const data = await res.json();
      setPreviews(data.previews || []);
      setStep("preview");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleImport = async () => {
    setError(null);

    try {
      const res = await fetch("/api/admin/media/import-xml-drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "import",
          fileIds: Array.from(selectedFiles),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Import failed");
      }

      setStep("importing");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleImportAll = async () => {
    setError(null);

    try {
      const res = await fetch("/api/admin/media/import-xml-drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "import",
          skipImported: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Import failed");
      }

      setStep("importing");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetToList = () => {
    setStep("list");
    setPreviews([]);
    setImportProgress(null);
    setSelectedFiles(new Set());
    fetchFiles();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-selfprimary-600 border-t-transparent" />
        <span className="ml-2">XML fájlok betöltése a Drive-ról...</span>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">
        📁 XML Import a Drive-ról
      </h2>

      {error && (
        <div className="mb-4 rounded-lg bg-danger-100 p-3 text-danger-700">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Bezárás
          </button>
        </div>
      )}

      {/* Step 1: File List */}
      {step === "list" && (
        <div>
          {/* Summary */}
          {summary && (
            <div className="mb-4 grid grid-cols-3 gap-4 rounded-lg bg-foreground-50 p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-selfprimary-600">
                  {summary.total}
                </div>
                <div className="text-sm text-foreground-500">Összes XML</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success-600">
                  {summary.imported}
                </div>
                <div className="text-sm text-foreground-500">Importálva</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning-600">
                  {summary.notImported}
                </div>
                <div className="text-sm text-foreground-500">Új</div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={handleImportAll}
              disabled={summary?.notImported === 0}
              className="rounded-lg bg-success-600 px-4 py-2 text-white hover:bg-success-700 disabled:opacity-50"
            >
              🚀 Összes új importálása ({summary?.notImported || 0})
            </button>
            <button
              onClick={selectAllNotImported}
              className="rounded-lg bg-selfprimary-600 px-4 py-2 text-white hover:bg-selfprimary-700"
            >
              Mind kijelölése
            </button>
            <button
              onClick={deselectAll}
              className="rounded-lg bg-foreground-500 px-4 py-2 text-white hover:bg-foreground-600"
            >
              Kijelölés törlése
            </button>
            <button
              onClick={fetchFiles}
              className="rounded-lg bg-foreground-300 px-4 py-2 text-foreground-700 hover:bg-foreground-400"
            >
              🔄 Frissítés
            </button>
          </div>

          {/* File List */}
          <div className="mb-4 max-h-96 overflow-y-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-foreground-100">
                <tr>
                  <th className="w-10 px-3 py-2"></th>
                  <th className="px-3 py-2 text-left">Fájlnév</th>
                  <th className="px-3 py-2 text-center">Állapot</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr
                    key={file.id}
                    className={`border-b hover:bg-foreground-50 ${
                      file.imported ? "opacity-50" : ""
                    }`}
                  >
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.id)}
                        onChange={() => toggleFile(file.id)}
                        className="h-4 w-4"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-mono text-xs">{file.name}</span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      {file.imported ? (
                        <span className="rounded bg-success-100 px-2 py-1 text-xs text-success-700">
                          ✓ Importálva
                        </span>
                      ) : (
                        <span className="rounded bg-warning-100 px-2 py-1 text-xs text-warning-700">
                          Új
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handlePreview}
              disabled={previewLoading || selectedFiles.size === 0}
              className="rounded-lg bg-selfprimary-600 px-6 py-2 text-white hover:bg-selfprimary-700 disabled:opacity-50"
            >
              {previewLoading
                ? "Betöltés..."
                : `Előnézet (${selectedFiles.size} fájl)`}
            </button>
            <button
              onClick={handleImport}
              disabled={selectedFiles.size === 0}
              className="rounded-lg bg-success-600 px-6 py-2 text-white hover:bg-success-700 disabled:opacity-50"
            >
              Import (${selectedFiles.size} fájl)
            </button>
          </div>

          {files.length === 0 && (
            <div className="p-8 text-center text-foreground-500">
              Nem található XML fájl a Drive mappában.
            </div>
          )}
        </div>
      )}

      {/* Step 2: Preview */}
      {step === "preview" && (
        <div>
          {/* Preview Summary */}
          <div className="mb-4 grid grid-cols-2 gap-4 rounded-lg bg-foreground-50 p-4 sm:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-selfprimary-600">
                {previews.length}
              </div>
              <div className="text-sm text-foreground-500">XML fájl</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success-600">
                {previews.filter((p) => p.matchedImageId !== null).length}
              </div>
              <div className="text-sm text-foreground-500">Egyező kép</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-danger-600">
                {previews.filter((p) => p.matchedImageId === null).length}
              </div>
              <div className="text-sm text-foreground-500">Nem egyező</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-selfsecondary-600">
                {previews.reduce((sum, p) => sum + p.tags.length, 0)}
              </div>
              <div className="text-sm text-foreground-500">Összes címke</div>
            </div>
          </div>

          {/* Preview List */}
          <div className="mb-4 max-h-96 overflow-y-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-foreground-100">
                <tr>
                  <th className="px-3 py-2 text-left">XML fájl</th>
                  <th className="px-3 py-2 text-left">Egyező kép</th>
                  <th className="px-3 py-2 text-left">Címkék</th>
                </tr>
              </thead>
              <tbody>
                {previews.map((preview) => (
                  <tr
                    key={preview.driveId}
                    className={`border-b ${
                      preview.matchedImageId ? "" : "bg-danger-50"
                    }`}
                  >
                    <td className="px-3 py-2">
                      <span className="font-mono text-xs">
                        {preview.xmlFileName}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {preview.matchedImageId ? (
                        <span className="text-success-600">
                          ✓ {preview.matchedImageName}
                        </span>
                      ) : (
                        <span className="text-danger-600">✗ Nem található</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {preview.tags.slice(0, 5).map((tag, idx) => (
                          <span
                            key={idx}
                            className={`rounded px-2 py-0.5 text-xs ${
                              tag.isPersonTag
                                ? "bg-primary-100 text-primary-800"
                                : "bg-foreground-200 text-foreground-700"
                            }`}
                          >
                            {tag.isPersonTag && "👤 "}
                            {tag.tagName}
                          </span>
                        ))}
                        {preview.tags.length > 5 && (
                          <span className="text-xs text-foreground-500">
                            +{preview.tags.length - 5}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={resetToList}
              className="rounded-lg bg-foreground-500 px-6 py-2 text-white hover:bg-foreground-600"
            >
              Vissza
            </button>
            <button
              onClick={handleImport}
              disabled={
                previews.filter((p) => p.matchedImageId !== null).length === 0
              }
              className="rounded-lg bg-success-600 px-6 py-2 text-white hover:bg-success-700 disabled:opacity-50"
            >
              Import megerősítése
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Importing */}
      {step === "importing" && importProgress && (
        <div>
          <div className="mb-4 rounded-lg bg-selfprimary-50 p-6">
            <h3 className="mb-4 text-lg font-semibold">Import folyamatban...</h3>

            <div className="mb-2 h-4 overflow-hidden rounded-full bg-foreground-200">
              <div
                className="h-full bg-selfprimary-600 transition-all"
                style={{
                  width: `${
                    importProgress.total > 0
                      ? (importProgress.current / importProgress.total) * 100
                      : 0
                  }%`,
                }}
              />
            </div>

            <p className="text-sm text-foreground-600">
              {importProgress.current} / {importProgress.total}
            </p>
            <p className="truncate text-sm text-foreground-500">
              {importProgress.currentFile}
            </p>

            <div className="mt-4 flex gap-4 text-sm">
              <span className="text-success-600">
                ✓ Importálva: {importProgress.imported}
              </span>
              <span className="text-foreground-500">
                Kihagyva: {importProgress.skipped}
              </span>
              {importProgress.errors.length > 0 && (
                <span className="text-danger-600">
                  Hibák: {importProgress.errors.length}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Done */}
      {step === "done" && importProgress && (
        <div className="text-center">
          <div className="mb-4 text-6xl">✅</div>
          <h3 className="mb-4 text-xl font-semibold">Import kész!</h3>
          <div className="mb-6 flex justify-center gap-6 text-sm">
            <span className="text-success-600">
              ✓ Importálva: {importProgress.imported}
            </span>
            <span className="text-foreground-500">
              Kihagyva: {importProgress.skipped}
            </span>
            {importProgress.errors.length > 0 && (
              <span className="text-danger-600">
                Hibák: {importProgress.errors.length}
              </span>
            )}
          </div>

          {importProgress.errors.length > 0 && (
            <details className="mb-4 text-left">
              <summary className="cursor-pointer text-danger-600">
                Hibák megjelenítése ({importProgress.errors.length})
              </summary>
              <ul className="mt-2 max-h-40 list-inside list-disc overflow-y-auto text-sm text-foreground-600">
                {importProgress.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </details>
          )}

          <button
            onClick={resetToList}
            className="rounded-lg bg-selfprimary-600 px-6 py-2 text-white hover:bg-selfprimary-700"
          >
            Kész
          </button>
        </div>
      )}
    </div>
  );
};

export default DriveXmlImporter;
