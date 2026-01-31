"use client";

import React, { useState, useCallback } from "react";

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
  xmlFileName: string;
  matchedImageId: number | null;
  matchedImageName: string | null;
  tags: TagImportPreview[];
  dateTimeOriginal?: string;
  warnings: string[];
}

interface ImportSummary {
  totalFiles: number;
  matchedImages: number;
  unmatchedImages: number;
  totalTags: number;
  personTags: number;
  warnings: number;
}

interface XMLImporterProps {
  onImportComplete: () => void;
}

const XMLImporter: React.FC<XMLImporterProps> = ({ onImportComplete }) => {
  const [xmlFiles, setXmlFiles] = useState<
    Array<{ fileName: string; content: string }>
  >([]);
  const [previews, setPreviews] = useState<XMLImportPreview[]>([]);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [step, setStep] = useState<"upload" | "preview" | "complete">("upload");

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      setError(null);
      const fileContents: Array<{ fileName: string; content: string }> = [];

      for (const file of Array.from(files)) {
        if (
          !file.name.endsWith(".xml")
          // && !file.name.endsWith(".xmp")
        ) {
          continue;
        }

        try {
          const content = await file.text();
          fileContents.push({
            fileName: file.name,
            content,
          });
        } catch (err) {
          console.error(`Error reading file ${file.name}:`, err);
        }
      }

      if (fileContents.length === 0) {
        setError("Nem található XML/XMP fájl. Kérlek, válassz XML fájlokat!");
        return;
      }

      setXmlFiles(fileContents);
    },
    [],
  );

  const handlePreview = async () => {
    if (xmlFiles.length === 0) {
      setError("Nincs feltöltött XML fájl");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/media/import-xml", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xmlFiles }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to parse XML files");
      }

      const data = await res.json();
      setPreviews(data.previews);
      setSummary(data.summary);
      setStep("preview");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    // Filter only matched images
    const validImports = previews
      .filter((p) => p.matchedImageId !== null)
      .map((p) => ({
        imageId: p.matchedImageId!,
        tags: p.tags.map((tag) => ({
          tag_name: tag.tagName,
          coordinate1_x: tag.coordinates?.x1 ?? null,
          coordinate1_y: tag.coordinates?.y1 ?? null,
          coordinate2_x: tag.coordinates?.x2 ?? null,
          coordinate2_y: tag.coordinates?.y2 ?? null,
        })),
      }));

    if (validImports.length === 0) {
      setError("Nincs importálható kép (nem találtunk egyező képeket)");
      return;
    }

    setImporting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/media/import-xml", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imports: validImports }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to import");
      }

      const result = await res.json();
      setSuccessMessage(
        `Import sikeres! ${result.summary.totalSuccess} címke hozzáadva ${result.summary.imagesProcessed} képhez.`,
      );
      setStep("complete");
      onImportComplete();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const resetImport = () => {
    setXmlFiles([]);
    setPreviews([]);
    setSummary(null);
    setError(null);
    setSuccessMessage(null);
    setStep("upload");
  };

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">XML Metaadat Import</h2>

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
        </div>
      )}

      {/* Step 1: Upload */}
      {step === "upload" && (
        <div>
          <div className="mb-4 rounded-lg bg-selfprimary-50 p-4">
            <h3 className="mb-2 font-medium">Útmutató</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-foreground-600">
              <li>Tölts fel XML/XMP fájlokat (pl. Lightroom exportból)</li>
              <li>
                Az XML fájlnévnek meg kell egyeznie a kép nevével (kiterjesztés
                nélkül)
              </li>
              <li>
                A rendszer automatikusan kinyeri a címkéket és arcjelöléseket
              </li>
              <li>Személynevek esetén a koordináták is mentésre kerülnek</li>
            </ul>
          </div>

          <div className="mb-4">
            <label className="block">
              <span className="mb-2 block font-medium">
                XML/XMP fájlok kiválasztása
              </span>
              <input
                type="file"
                accept=".xml" // + ",.xmp"
                multiple
                onChange={handleFileUpload}
                className="block w-full rounded-lg border bg-foreground px-4 py-2 file:mr-4 file:rounded-sm file:border-0 file:bg-selfprimary-600 file:px-4 file:py-2 file:text-foreground hover:file:bg-selfprimary-700"
              />
            </label>
          </div>

          {xmlFiles.length > 0 && (
            <div className="mb-4 rounded-lg bg-foreground-50 p-4">
              <h3 className="mb-2 font-medium">
                {xmlFiles.length} fájl kiválasztva:
              </h3>
              <ul className="max-h-40 overflow-y-auto text-sm">
                {xmlFiles.map((file, idx) => (
                  <li key={idx} className="py-1">
                    📄 {file.fileName}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={handlePreview}
            disabled={loading || xmlFiles.length === 0}
            className="rounded-lg bg-selfprimary-600 px-6 py-2 text-foreground hover:bg-selfprimary-700 disabled:opacity-50"
          >
            {loading ? "Feldolgozás..." : "Előnézet"}
          </button>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === "preview" && summary && (
        <div>
          {/* Summary */}
          <div className="mb-4 grid grid-cols-2 gap-4 rounded-lg bg-foreground-50 p-4 sm:grid-cols-3 lg:grid-cols-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-selfprimary-600">
                {summary.totalFiles}
              </div>
              <div className="text-sm text-foreground-500">XML fájl</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success-600">
                {summary.matchedImages}
              </div>
              <div className="text-sm text-foreground-500">Egyező kép</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-danger-600">
                {summary.unmatchedImages}
              </div>
              <div className="text-sm text-foreground-500">Nem egyező</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-selfsecondary-600">
                {summary.totalTags}
              </div>
              <div className="text-sm text-foreground-500">Összes címke</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {summary.personTags}
              </div>
              <div className="text-sm text-foreground-500">Személy címke</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary-600">
                {summary.warnings}
              </div>
              <div className="text-sm text-foreground-500">Figyelmeztetés</div>
            </div>
          </div>

          {/* Previews List */}
          <div className="mb-4 max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-foreground-100">
                <tr>
                  <th className="px-3 py-2 text-left">XML fájl</th>
                  <th className="px-3 py-2 text-left">Egyező kép</th>
                  <th className="px-3 py-2 text-left">Címkék</th>
                  <th className="px-3 py-2 text-left">Figyelmeztetések</th>
                </tr>
              </thead>
              <tbody>
                {previews.map((preview, idx) => (
                  <tr
                    key={idx}
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
                        {preview.tags.slice(0, 5).map((tag, tagIdx) => (
                          <span
                            key={tagIdx}
                            className={`rounded px-2 py-0.5 text-xs ${
                              tag.isPersonTag
                                ? "bg-primary-100 text-primary-800"
                                : "bg-foreground-200 text-foreground-700"
                            }`}
                            title={
                              tag.coordinates
                                ? `Koordináták: (${tag.coordinates.x1}, ${tag.coordinates.y1}) - (${tag.coordinates.x2}, ${tag.coordinates.y2})`
                                : undefined
                            }
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
                    <td className="px-3 py-2">
                      {preview.warnings.length > 0 && (
                        <span
                          className="cursor-help text-yellow-600"
                          title={preview.warnings.join("\n")}
                        >
                          ⚠️ {preview.warnings.length}
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
              onClick={resetImport}
              className="rounded-lg bg-foreground-500 px-6 py-2 text-foreground hover:bg-foreground-600"
            >
              Vissza
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={importing || summary.matchedImages === 0}
              className="rounded-lg bg-success-600 px-6 py-2 text-foreground hover:bg-success-700 disabled:opacity-50"
            >
              {importing
                ? "Importálás..."
                : `Import megerősítése (${summary.matchedImages} kép)`}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Complete */}
      {step === "complete" && (
        <div className="text-center">
          <div className="mb-4 text-6xl">✅</div>
          <h3 className="mb-4 text-xl font-semibold">Import sikeres!</h3>
          <button
            onClick={resetImport}
            className="rounded-lg bg-selfprimary-600 px-6 py-2 text-foreground hover:bg-selfprimary-700"
          >
            Új import
          </button>
        </div>
      )}
    </div>
  );
};

export default XMLImporter;
