"use client";

import React, { useRef, useState, useCallback } from "react";
import { Button } from "@heroui/react";

// SVG icons as components
const CameraIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

const UploadIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7,10 12,15 17,10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const XIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const FlipCameraIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M16 5l3 3m0 0l-3 3m3-3H3" />
    <path d="M8 19l-3-3m0 0l3-3m-3 3h18" />
    <path d="M14.5 2h-5L7 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

interface CameraUploadProps {
  readonly onUpload: (file: File) => void;
  readonly isUploading?: boolean;
}

export default function CameraUpload({
  onUpload,
  isUploading,
}: CameraUploadProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment",
  );
  const [canFlipCamera, setCanFlipCamera] = useState(false);

  const startCamera = useCallback(async () => {
    console.log("Starting camera with facing mode:", facingMode);
    setIsLoadingCamera(true);
    setIsStreaming(false);

    try {
      // Ellenőrizzük, hogy milyen kamerák érhetők el
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(
        (device) => device.kind === "videoinput",
      );

      // Ha több kamera elérhető, engedélyezzük a váltást
      setCanFlipCamera(videoInputs.length > 1);

      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode },
        audio: false,
      });

      console.log("Stream obtained:", stream);
      streamRef.current = stream;

      // Video elem már elérhető, azonnal beállíthatjuk
      if (videoRef.current) {
        console.log("Setting video stream");
        videoRef.current.srcObject = stream;

        // Várjuk meg, hogy a video elkezdjen lejátszódni
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded, starting stream");
          setIsStreaming(true);
          setIsLoadingCamera(false);
        };
      }
    } catch (error) {
      console.error("Camera error:", error);
      alert(
        "Kamera hiba: " +
          (error instanceof Error ? error.message : "Ismeretlen hiba"),
      );
      setIsLoadingCamera(false);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
    setCapturedImage(null);
  }, []);

  const flipCamera = useCallback(async () => {
    // Állítsuk le a jelenlegi streamet
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Váltsuk át a facing mode-ot
    const newFacingMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newFacingMode);

    // Állítsuk vissza az állapotokat
    setIsStreaming(false);
    setCapturedImage(null);

    // Indítsuk újra a kamerát az új facing mode-dal
    setTimeout(() => {
      startCamera();
    }, 100);
  }, [facingMode, startCamera]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(imageDataUrl);
  }, []);

  const uploadCapturedImage = useCallback(() => {
    if (!capturedImage || !canvasRef.current) return;

    canvasRef.current.toBlob(
      (blob) => {
        if (!blob) return;

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const file = new File([blob], `camera-photo-${timestamp}.jpg`, {
          type: "image/jpeg",
        });

        onUpload(file);
        setCapturedImage(null);
        stopCamera();
      },
      "image/jpeg",
      0.8,
    );
  }, [capturedImage, onUpload, stopCamera]);

  const renderCameraView = () => {
    return (
      <>
        {/* Video elem mindig legyen a DOM-ban, így a ref elérhető */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`h-full w-full object-cover ${isStreaming ? "block" : "hidden"}`}
          onClick={isStreaming ? capturePhoto : undefined}
        />

        {/* Loading overlay */}
        {isLoadingCamera && (
          <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-gray-100 text-gray-500 dark:bg-gray-800">
            <div className="text-center">
              <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <p className="text-sm">Kamera inicializálása...</p>
            </div>
          </div>
        )}

        {/* Live indicator */}
        {isStreaming && (
          <div className="absolute right-2 top-2 rounded bg-green-500 px-2 py-1 text-xs text-white">
            LIVE
          </div>
        )}

        {/* Captured image */}
        {capturedImage && (
          <>
            <img
              src={capturedImage}
              alt="Készített kép"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute right-2 top-2 rounded bg-blue-500 px-2 py-1 text-xs text-white">
              KÉSZ
            </div>
          </>
        )}

        {/* Default camera icon */}
        {!isStreaming && !isLoadingCamera && !capturedImage && (
          <div className="absolute inset-0 flex h-full w-full items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="mx-auto mb-2 h-16 w-16">
                <CameraIcon />
              </div>
              <p className="text-sm">Kattints a kamera indításhoz</p>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
        {renderCameraView()}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="flex flex-wrap justify-center gap-2">
        {!isStreaming && !capturedImage && !isLoadingCamera && (
          <>
            <Button
              color="primary"
              onPress={startCamera}
              startContent={<CameraIcon />}
            >
              Kamera indítás
            </Button>
            <Button
              color="secondary"
              size="sm"
              onPress={() => {
                console.log("=== DEBUG INFO ===");
                console.log("isStreaming:", isStreaming);
                console.log("isLoadingCamera:", isLoadingCamera);
                console.log("capturedImage:", capturedImage);
                console.log("videoRef.current:", videoRef.current);
                console.log("streamRef.current:", streamRef.current);
                if (videoRef.current) {
                  console.log("video.readyState:", videoRef.current.readyState);
                  console.log("video.srcObject:", videoRef.current.srcObject);
                }
              }}
            >
              Debug
            </Button>
          </>
        )}

        {isLoadingCamera && (
          <Button color="primary" isLoading disabled>
            Kamera indítása...
          </Button>
        )}

        {isStreaming && !capturedImage && (
          <>
            <Button
              color="primary"
              onPress={capturePhoto}
              startContent={<CameraIcon />}
            >
              Fényképezés
            </Button>
            {canFlipCamera && (
              <Button
                color="secondary"
                variant="flat"
                onPress={flipCamera}
                startContent={<FlipCameraIcon />}
                size="sm"
              >
                {facingMode === "environment" ? "Előlapi" : "Hátsó"}
              </Button>
            )}
            <Button
              color="danger"
              variant="light"
              onPress={stopCamera}
              startContent={<XIcon />}
            >
              Bezárás
            </Button>
          </>
        )}

        {capturedImage && (
          <>
            <Button
              color="success"
              onPress={uploadCapturedImage}
              isLoading={isUploading}
              startContent={!isUploading && <UploadIcon />}
            >
              {isUploading ? "Feltöltés..." : "Feltöltés"}
            </Button>
            <Button
              color="warning"
              variant="light"
              onPress={() => setCapturedImage(null)}
            >
              Újra
            </Button>
            <Button
              color="danger"
              variant="light"
              onPress={stopCamera}
              startContent={<XIcon />}
            >
              Bezárás
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
