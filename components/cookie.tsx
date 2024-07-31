"use client";
import { Button, Modal, ModalContent } from "@nextui-org/react";
import React from "react";

const checkCookie = () => {
  if (document.cookie.indexOf("cookieAccepted=true") === -1) {
    return false;
  }
  return true;
};

const Cookie = () => {
  const [cookieAccepted, setCookieAccepted] = React.useState(checkCookie());
  const [showCookie, setShowCookie] = React.useState(!cookieAccepted);

  const acceptCookie = () => {
    document.cookie = "cookieAccepted=true; max-age=31536000";
    setCookieAccepted(true);
    setShowCookie(false);
  };

  if (!showCookie) {
    return null;
  }

  return (
    <Modal
      isOpen={showCookie}
      title="Cookie Policy"
      placement="bottom"
      className="m-16 fixed"
      shouldBlockScroll={false}
      backdrop="transparent"
    >
      <ModalContent className="p-6 text-foreground">
        <p>
          Az oldal sütiket használ a felhasználói élmény javítása érdekében. 🍪
          Az oldal használatával elfogadod a Cookie-kal kapcsolatos
          irányelveinket.
        </p>
        <Button color="warning" onClick={acceptCookie}>
          🍪 Rendben 🍪
        </Button>
      </ModalContent>
    </Modal>
  );
};

export default Cookie;
