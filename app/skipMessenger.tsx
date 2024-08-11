import { Modal, ModalContent, ModalHeader } from "@nextui-org/react";
import React, { useEffect, useState } from "react";

const SkipMessenger: React.FC = () => {
  const [isMessengerBrowser, setIsMessengerBrowser] = useState(false);

  useEffect(() => {
    // Ellenőrzi, hogy a felhasználó a Messenger beépített böngészőjét használja-e
    const userAgent =
      navigator.userAgent || navigator.vendor || (window as any).opera;
    if (
      userAgent.includes("FBAN") ||
      userAgent.includes("FBAV") ||
      userAgent.includes("Messenger")
    ) {
      setIsMessengerBrowser(true);
    }
  }, []);

  useEffect(() => {
    if (isMessengerBrowser) {
      // Átirányítás Chrome-ba, vagy Safari-ra (iOS)
      const chromeUrl = `googlechrome://navigate?url=${window.location.href}`;
      const safariUrl = `https://www.google.com/chrome/`;

      window.location.href = chromeUrl;

      setTimeout(() => {
        window.location.href = safariUrl;
      }, 500); // 500ms várakozás után átirányítás Safari-ra, ha a Chrome nem található
    }
  }, [isMessengerBrowser]);

  return (
    <>
      {isMessengerBrowser ? (
        <Modal isOpen={isMessengerBrowser}>
          <ModalContent className="text-center p-5">
            <ModalHeader>Átirányítás...</ModalHeader>
            <p>
              Az oldal megtekintéséhez használja a Google Chrome böngészőt vagy
              a Safari-t (iOS).
            </p>
          </ModalContent>
        </Modal>
      ) : null}
    </>
  );
};

export default SkipMessenger;
