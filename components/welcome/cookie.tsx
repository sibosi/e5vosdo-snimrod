"use client";
import { Button, Modal, ModalContent } from "@heroui/react";
import Link from "next/link";
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
  const [position, setPosition] = useState<"center" | "bottom">("bottom");

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
      placement={position}
      className="fixed m-16"
      shouldBlockScroll={false}
      backdrop="transparent"
      onClose={() => setPosition("center")}
      hideCloseButton={true}
    >
      <ModalContent className="p-6 text-foreground">
        <p>
          Az oldal sütiket használ a felhasználói élmény javítása érdekében. 🍪
          Az oldal használatával elfogadod a{" "}
          <Link href="/security" className="text-selfprimary-800">
            Cookie-kal kapcsolatos irányelveinket
          </Link>{" "}
          és az{" "}
          <Link href="/security" className="text-selfprimary-800">
            adatvédelmi szabályzatunkat.
          </Link>
        </p>
        <Button color="warning" onPress={acceptCookie}>
          🍪 Rendben 🍪
        </Button>
      </ModalContent>
    </Modal>
  );
};

export default Cookie;
