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
    width="14"
    height="14"
    fill="currentColor"
    className="bi bi-download my-auto"
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

function getBrowser() {
  const userAgent = window.navigator.userAgent;
  if (userAgent.indexOf("Firefox") > -1) return "firefox";
  else if (userAgent.indexOf("SamsungBrowser") > -1) return "samsung";
  else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1)
    return "opera";
  else if (userAgent.indexOf("Trident") > -1) return "ie";
  else if (userAgent.indexOf("Edge") > -1) return "edge";
  else if (userAgent.indexOf("Chrome") > -1) return "chrome";
  else if (userAgent.indexOf("Safari") > -1) return "safari";
  else if (userAgent.indexOf("Arc") > -1) return "arc";
  else return undefined;
}

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
          onClick={handleInstallClick}
          className={
            "bg-selfsecondary-300 align-middle " +
            (size == "small" ? "p-0" : "")
          }
        >
          {size == "small" ? (
            InstallIcon
          ) : (
            <span className="inline-flex gap-1 align-middle">
              {InstallIcon} App{" "}
            </span>
          )}
        </Chip>
      ) : (
        isIOSDevice && (
          <Chip
            onClick={() => setModalOpen(true)}
            className={"fill-selfprimary " + (size == "small" ? "p-0" : "")}
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
          <ModalContent className="text-lg">
            <ModalHeader>
              App telepítéséhez iOS-en, {getBrowser()} böngészőben
            </ModalHeader>
            {{
              safari: (
                <ModalBody>
                  <p className="flex gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="25"
                      height="25"
                      fill="currentColor"
                      className="bi bi-box-arrow-up m-auto min-w-max"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M3.5 6a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 1 0-1h2A1.5 1.5 0 0 1 14 6.5v8a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 14.5v-8A1.5 1.5 0 0 1 3.5 5h2a.5.5 0 0 1 0 1z"
                      />
                      <path
                        fill-rule="evenodd"
                        d="M7.646.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 1.707V10.5a.5.5 0 0 1-1 0V1.707L5.354 3.854a.5.5 0 1 1-.708-.708z"
                      />
                    </svg>
                    Nyomd meg a megosztás gombot az alul lévő navigációs sávon.
                  </p>
                  <p className="flex gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="25"
                      height="25"
                      fill="currentColor"
                      className="bi bi-plus-square m-auto min-w-max"
                      viewBox="0 0 16 16"
                    >
                      <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
                      <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                    </svg>
                    <span>
                      Keresd meg és válaszd ki az{" "}
                      <strong>Alkalmazás hozzáadása</strong> opciót.
                    </span>
                  </p>
                  <p>
                    Erősítsd meg az <strong>Hozzáadás</strong> gomb
                    megnyomásával.
                  </p>
                </ModalBody>
              ),
              chrome: (
                <ModalBody>
                  <p className="flex gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="25"
                      height="25"
                      fill="currentColor"
                      className="bi bi-box-arrow-up m-auto min-w-max"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M3.5 6a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 1 0-1h2A1.5 1.5 0 0 1 14 6.5v8a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 14.5v-8A1.5 1.5 0 0 1 3.5 5h2a.5.5 0 0 1 0 1z"
                      />
                      <path
                        fill-rule="evenodd"
                        d="M7.646.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 1.707V10.5a.5.5 0 0 1-1 0V1.707L5.354 3.854a.5.5 0 1 1-.708-.708z"
                      />
                    </svg>
                    Nyomd meg a megosztás gombot a jobb felső sarokban.
                  </p>
                  <p className="flex gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="25"
                      height="25"
                      fill="currentColor"
                      className="bi bi-plus-square m-auto min-w-max"
                      viewBox="0 0 16 16"
                    >
                      <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
                      <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                    </svg>
                    <span>
                      Keresd meg és válaszd ki az{" "}
                      <strong>Alkalmazás hozzáadása</strong> opciót.
                    </span>
                  </p>
                  <p>
                    Erősítsd meg az <strong>Hozzáadás</strong> gomb
                    megnyomásával.
                  </p>
                </ModalBody>
              ),
            }[getBrowser() as "safari"] || (
              <ModalBody>
                <p>
                  Az alkalmazás telepítéséhez nyomd meg a{" "}
                  <strong>megosztás</strong> gombot az alul lévő navigációs
                  sávon, majd válaszd ki az{" "}
                  <strong>Alkalmazás hozzáadása</strong> opciót.
                </p>
              </ModalBody>
            )}
            <ModalFooter>
              <Button onPress={() => setModalOpen(false)}>Bezárás</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default InstallPWAButton;
