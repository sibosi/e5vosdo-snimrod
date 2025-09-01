"use client";

import { MediaImageType } from "@/db/mediaPhotos";
import React, { useCallback, useEffect, useMemo, useState } from "react";

type TokenClientType = {
  requestAccessToken: (opts?: { prompt?: string }) => void;
};

declare global {
  interface Window {
    google?: any;
  }
}

const useDriveFileUrl = (
  fileId: string | null | undefined,
  accessToken: string | null,
) => {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!fileId) {
      setUrl("");
      setLoading(false);
      setError("Missing fileId");
      return;
    }
    if (!accessToken) {
      setUrl("");
      setLoading(false);
      setError("No access token");
      return;
    }

    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${accessToken}` },
            signal: controller.signal,
          },
        );
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Drive file fetch failed: ${res.status} ${text}`);
        }
        const blob = await res.blob();
        if (!isMounted) return;
        const objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        console.error("Drive fetch error", e);
        setError(e?.message || String(e));
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();

    return () => {
      isMounted = false;
      controller.abort();
      if (url) URL.revokeObjectURL(url);
    };
  }, [fileId, accessToken]);

  return { url, loading, error } as const;
};

const AuthenticatedImage = ({
  fileId,
  fileName,
  accessToken,
  bgColor,
}: {
  fileId: string;
  fileName: string;
  accessToken: string | null;
  bgColor?: string;
}) => {
  const {
    url: imageSrc,
    loading,
    error,
  } = useDriveFileUrl(fileId, accessToken);

  if (loading) {
    return (
      <div
        style={{ backgroundColor: bgColor ?? "gray" }}
        className="flex h-[100px] w-[100px] items-center justify-center text-sm text-gray-500"
      >
        <p>Betöltés...</p>
      </div>
    );
  }
  if (error || !imageSrc) {
    return (
      <div className="flex h-[100px] w-[100px] items-center justify-center bg-red-100 text-sm text-red-500">
        <p>Failed</p>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={fileName}
      width={100}
      height={100}
      className="inset-0 cursor-pointer"
    />
  );
};

const PhotoGrid = ({ GOOGLE_CLIENT_ID }: { GOOGLE_CLIENT_ID: string }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenClient, setTokenClient] = useState<TokenClientType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [imageFiles, setImageFiles] = useState<MediaImageType[]>();
  const [selected, setSelected] = useState<MediaImageType | null>(null);

  function loadImages() {
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
        }
      })
      .catch((err) => {
        console.error("Error fetching images:", err);
      });
  }

  useEffect(() => {
    loadImages();
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadGsi = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.google && window.google.accounts && mounted) {
          resolve();
          return;
        }
        const s = document.createElement("script");
        s.src = "https://accounts.google.com/gsi/client";
        s.async = true;
        s.defer = true;
        s.onload = () => resolve();
        s.onerror = (e) => reject(new Error("Failed to load GSI script"));
        document.head.appendChild(s);
      });
    };

    const init = async () => {
      try {
        await loadGsi();

        if (!mounted) return;

        const client = (window.google as any).accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: "https://www.googleapis.com/auth/drive.readonly",
          callback: (resp: any) => {
            if (resp.error) {
              console.error("Token client callback error:", resp);
              setError(resp.error_description || resp.error || "Token error");
              return;
            }
            setAccessToken(resp.access_token);
          },
        });

        setTokenClient(client);
        setLoading(false);
      } catch (err: any) {
        console.error("Init GIS failed:", err);
        setError(err.message || String(err));
        setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = () => {
    setError("");
    if (!tokenClient) {
      setError("Token client not initialized");
      return;
    }
    try {
      tokenClient.requestAccessToken({ prompt: "" });
    } catch (err: any) {
      console.error("requestAccessToken error:", err);
      setError(err.message || String(err));
    }
  };

  const signOut = () => {
    setAccessToken(null);
  };

  const closeModal = useCallback(() => setSelected(null), []);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, closeModal]);

  const downloadOriginal = useCallback(
    async (fileId: string, suggestedName?: string | null) => {
      if (!accessToken) return;
      try {
        const res = await fetch(
          `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`,
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Download failed: ${res.status} ${text}`);
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = suggestedName || "image";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch (e) {
        console.error(e);
        alert("A letöltés nem sikerült.");
      }
    },
    [accessToken],
  );

  if (loading) {
    return <div className="p-8">Loading auth...</div>;
  }

  if (error) {
    return (
      <div className="mb-4 rounded-3xl border-2 border-red-400 bg-red-100 p-4">
        <p className="text-red-700">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 rounded bg-red-500 px-4 py-2 text-white"
        >
          Újratöltés
        </button>
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="mb-4 rounded-3xl border-2 border-selfprimary-400 bg-selfprimary-100 p-4">
          <h3 className="mb-2 font-bold text-selfprimary-800">
            Helló az Eötvös Média fotói közt!
          </h3>
          <p>
            A média korábbi oldala sajnálatos módon megszűnt, így a médiabrigád
            fotóit mostantól itt találhatod meg. A jelenlegi szerver és
            tárhelykapacitások miatt a médiás fotókhoz a Google Drive
            segítségével lehet hozzáférni, ezért a továbblépéshez bejelentkezés
            és Google Drive hozzáférés szükséges.
          </p>
          <p className="mt-2 text-sm text-selfprimary-700">
            Győződj meg róla, hogy a böngésző nem blokkolja a popupokat vagy a
            harmadik fél sütiket (privát mód is okozhat problémát).
          </p>
        </div>

        <div className="text-center">
          <button
            onClick={signIn}
            className="rounded-lg bg-selfprimary-500 px-6 py-3 text-selfprimary-50"
          >
            Bejelentkezés
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Eötvös Média - Galéria</h1>
        <div>
          <button
            onClick={signOut}
            className="rounded bg-gray-500 px-4 py-2 text-white"
          >
            Kijelentkezés
          </button>
        </div>
      </div>

      {imageFiles === undefined && (
        <div className="p-8 text-center">
          <p>Képek betöltése...</p>
        </div>
      )}

      {imageFiles?.length === 0 ? (
        <div className="p-8 text-center">
          <p>No images found in the media folder.</p>
          <button
            onClick={() => loadImages()}
            className="mt-4 rounded bg-selfprimary-500 px-4 py-2 text-selfprimary-50"
          >
            Újratöltés
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-2">
          {imageFiles?.map((f) => (
            <button
              key={f.compressed_drive_id}
              type="button"
              className="focus:outline-none"
              onClick={() => setSelected(f)}
              title="Megnyitás nagyban"
            >
              <AuthenticatedImage
                fileId={f.compressed_drive_id}
                fileName={f.compressed_file_name ?? "image"}
                accessToken={accessToken}
                bgColor={f.color}
              />
            </button>
          ))}
        </div>
      )}

      {selected && (
        <ImageModal
          onClose={closeModal}
          accessToken={accessToken}
          fileId={selected.original_drive_id}
          fileName={
            selected.original_file_name ||
            selected.compressed_file_name ||
            "image"
          }
          bgColor={selected.color}
          onDownload={() =>
            downloadOriginal(
              selected.original_drive_id,
              selected.original_file_name || selected.compressed_file_name,
            )
          }
        />
      )}
    </div>
  );
};

const ImageModal = ({
  onClose,
  accessToken,
  fileId,
  fileName,
  bgColor,
  onDownload,
}: {
  onClose: () => void;
  accessToken: string | null;
  fileId: string;
  fileName: string;
  bgColor?: string | null;
  onDownload: () => void;
}) => {
  const { url, loading, error } = useDriveFileUrl(fileId, accessToken);

  const title = useMemo(() => fileName || "Kép", [fileName]);

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
              className="rounded bg-selfprimary-600 px-3 py-2 text-sm text-white"
              onClick={onDownload}
            >
              Letöltés
            </button>
            <button
              className="rounded bg-selfsecondary-600 px-3 py-2 text-sm text-white"
              onClick={onClose}
            >
              Bezárás
            </button>
          </div>
        </div>

        <div
          className="flex max-h-[80vh] items-center justify-center overflow-auto rounded-lg border"
          style={{ backgroundColor: bgColor ?? "#f3f4f6" }}
        >
          {loading && (
            <div className="p-8 text-sm text-gray-600">Betöltés…</div>
          )}
          {error && (
            <div className="p-8 text-sm text-red-600">Hiba: {error}</div>
          )}
          {!loading && !error && url && (
            <img
              src={url}
              alt={title}
              className="max-h-[80vh] w-auto max-w-full object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoGrid;
