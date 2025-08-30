"use client";

import { MediaImageType } from "@/db/mediaImages";
import React, { useEffect, useState } from "react";

type TokenClientType = {
  requestAccessToken: (opts?: { prompt?: string }) => void;
};

declare global {
  interface Window {
    google?: any;
  }
}

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
  const [imageSrc, setImageSrc] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!accessToken) {
      setError("No access token");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            signal: controller.signal,
          },
        );

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Drive file fetch failed: ${res.status} ${text}`);
        }

        const blob = await res.blob();
        if (!isMounted) return;
        const url = URL.createObjectURL(blob);
        setImageSrc(url);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Error fetching image:", err);
        setError(err.message || String(err));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
      controller.abort();
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [fileId, accessToken]);

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
      className="inset-0"
    />
  );
};

const PhotoGrid = ({ GOOGLE_CLIENT_ID }: { GOOGLE_CLIENT_ID: string }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenClient, setTokenClient] = useState<TokenClientType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [imageFiles, setImageFiles] = useState<MediaImageType[]>();

  function loadImages() {
    fetch("/api/getImages", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        module: "mediaImages",
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
            <AuthenticatedImage
              key={f.compressed_drive_id}
              fileId={f.compressed_drive_id}
              fileName={f.compressed_file_name ?? "image"}
              accessToken={accessToken}
              bgColor={f.color}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoGrid;
