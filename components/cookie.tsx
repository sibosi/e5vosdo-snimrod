"use client";
import { Button, Modal, ModalContent } from "@heroui/react";
import React, { useEffect, useState } from "react";

const checkCookie = () => {
  if (typeof document !== "undefined") {
    return document.cookie.indexOf("cookieAccepted=true") !== -1;
  }
  return false;
};

const Cookie = () => {
  const [cookieAccepted, setCookieAccepted] = useState(false);
  const [showCookie, setShowCookie] = useState(false);

  useEffect(() => {
    const isCookieAccepted = checkCookie();
    setCookieAccepted(isCookieAccepted);
    setShowCookie(!isCookieAccepted);
  }, []);

  const acceptCookie = () => {
    if (typeof document !== "undefined") {
      document.cookie = "cookieAccepted=true; max-age=31536000";
      setCookieAccepted(true);
      setShowCookie(false);
    }
  };

  if (!showCookie) {
    return null;
  }

  return (
    <Modal
      isOpen={showCookie}
      title="Cookie Policy"
      placement="bottom"
      className="fixed m-16"
      shouldBlockScroll={false}
      backdrop="transparent"
    >
      <ModalContent className="p-6 text-foreground">
        <p>
          Az oldal sütiket használ a felhasználói élmény javítása érdekében. 🍪
          Az oldal használatával elfogadod a Cookie-kal kapcsolatos
          irányelveinket.
        </p>
        <Button color="warning" onPress={acceptCookie}>
          🍪 Rendben 🍪
        </Button>
      </ModalContent>
    </Modal>
  );
};

export default Cookie;
