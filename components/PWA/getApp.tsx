"use client";
import {
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { useEffect, useState } from "react";

const InstallIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    fill="currentColor"
    className="bi bi-download"
    viewBox="0 0 16 16"
  >
    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z" />
  </svg>
);

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

const showIosInstallModal = () => {
  // detect if the device is on iOS
  const isIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  };

  // check if the device is in standalone mode
  const isInStandaloneMode = () => {
    return (
      "standalone" in (window as any).navigator &&
      (window as any).navigator.standalone
    );
  };

  return isIos() && !isInStandaloneMode();
};

const InstallPWAButton = ({ size }: { size?: "small" | "medium" }) => {
  const deferredPrompt = usePWAInstallPrompt();
  const [isVisible, setIsVisible] = useState(false);

  // iOS
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (deferredPrompt) {
      setIsVisible(true);
    }

    if (showIosInstallModal()) {
      setIsIOSDevice(true);
    }
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (isIOSDevice) {
      setModalOpen(true);
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await (deferredPrompt as any).userChoice;
      if (outcome === "accepted") {
        console.log("PWA installed");
      } else {
        console.log("PWA installation dismissed");
      }
      setIsVisible(false);
    }
  };

  return (
    <>
      {isVisible ? (
        <Chip
          color="primary"
          onClick={handleInstallClick}
          className={size == "small" ? "p-0" : ""}
        >
          {size == "small" ? InstallIcon : "App letöltése"}
        </Chip>
      ) : (
        isIOSDevice && (
          <Chip
            color="primary"
            onClick={() => setModalOpen(true)}
            className={size == "small" ? "p-0" : ""}
          >
            {size == "small" ? InstallIcon : "App letöltése"}
          </Chip>
        )
      )}

      {isIOSDevice && (
        <Modal
          closeButton
          aria-labelledby="modal-title"
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          className="text-foreground"
        >
          <ModalContent>
            <ModalHeader>
              Hogyan telepítsd az alkalmazást iOS eszközödön?
            </ModalHeader>
            <ModalBody>
              <p>
                1. Nyomd meg a <strong>Megosztás</strong> gombot az alul lévő
                navigációs sávon.
              </p>
              <p>
                2. Válaszd ki az <strong>Hozzáadás a kezdőképernyőhöz</strong>{" "}
                opciót.
              </p>
              <p>
                3. Erősítsd meg az <strong>Hozzáadás</strong> gomb
                megnyomásával.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setModalOpen(false)}>Bezárás</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default InstallPWAButton;
