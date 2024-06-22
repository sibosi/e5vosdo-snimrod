"use client";
import { Chip } from "@nextui-org/react";
import { useEffect, useState } from "react";

const usePWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  return deferredPrompt;
};

const InstallPWAButton = () => {
  const deferredPrompt = usePWAInstallPrompt();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (deferredPrompt) {
      setIsVisible(true);
    }
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await (deferredPrompt as any).userChoice;
    if (outcome === "accepted") {
      console.log("PWA installed");
    } else {
      console.log("PWA installation dismissed");
    }
    setIsVisible(false);
  };

  return (
    <>
      {isVisible && (
        <Chip color="primary" onClick={handleInstallClick}>
          App letöltése
        </Chip>
      )}
    </>
  );
};

export default InstallPWAButton;
