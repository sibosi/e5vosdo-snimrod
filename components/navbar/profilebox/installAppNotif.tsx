"use client";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { NotificationBox } from "./notificationBox";

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

const InstallAppNotif = () => {
  const deferredPrompt = usePWAInstallPrompt();
  const [isVisible, setIsVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [hasPWA, setHasPWA] = useState(false);

  useEffect(() => {
    setIsIOS(/iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()));

    if (isIOS) {
      // Check if the device is in standalone mode on iOS
      // check if the device is in standalone mode
      const isInStandaloneMode =
        "standalone" in (window as any).navigator &&
        (window as any).navigator.standalone;

      setHasPWA(!isInStandaloneMode);
    } else {
      // Check if the app is in standalone mode on Android or other platforms
      setHasPWA(deferredPrompt ? true : false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (deferredPrompt || hasPWA) {
      setIsVisible(true);
    }
  }, [deferredPrompt, hasPWA]);

  const handleInstallClick = async () => {
    if (isIOS) {
      setModalOpen(true);
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(
        outcome === "accepted" ? "PWA installed" : "PWA installation dismissed",
      );
      setIsVisible(false);
    }
  };

  return (
    <>
      {isVisible && (
        <NotificationBox
          icon={InstallIcon}
          title="App telepítése"
          body="Kattints ide az alkalmazás telepítéséhez!"
          onClick={handleInstallClick}
          color="selfprimary"
        />
      )}

      {isIOS && (
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
              <Button onPress={() => setModalOpen(false)}>Bezárás</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default InstallAppNotif;
