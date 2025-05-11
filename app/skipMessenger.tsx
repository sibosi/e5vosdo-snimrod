"use client";
import { siteConfig } from "@/config/site";
import { Button, Modal, ModalContent, ModalHeader } from "@heroui/react";
import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";

export function checkMessengerBrowser() {
  // Ellenőrzi, hogy a felhasználó a Messenger beépített böngészőjét használja-e
  if (typeof navigator === "undefined") return false;
  const userAgent =
    navigator.userAgent || navigator.vendor || (window as any).opera;
  if (
    userAgent.includes("FBAN") ||
    userAgent.includes("FBAV") ||
    userAgent.includes("Messenger")
  ) {
    return true;
  }
  return false;
}

export const CopyUrlButton = ({ props }: { props: any }) => {
  return (
    <Button
      onPress={() => {
        navigator.clipboard.writeText(siteConfig.links.home);
        redirect(window.location.href);
      }}
      {...props}
    >
      Cím másolása
    </Button>
  );
};

export const RedirectUrlButton = ({
  props,
  url,
  text,
}: {
  props: any;
  url: string;
  text: string;
}) => {
  return (
    <Button
      onPress={() => {
        redirect(url);
      }}
      {...props}
    >
      {text}
    </Button>
  );
};

export const SkipMessengerModal = ({ isOpen }: { isOpen: boolean }) => {
  return (
    <Modal isOpen={isOpen}>
      <ModalContent className="p-5 text-center">
        <ModalHeader>Átirányítás...</ModalHeader>
        <p>
          A Messenger beépített böngészője nem támogatott. Az oldal
          megtekintéséhez használja a Google Chrome böngészőt vagy a Safari-t
          (iOS).
        </p>
        <p className="tegt-xl font-bold text-selfprimary">e5vosdo.hu</p>
        <Button
          onPress={() => {
            navigator.clipboard.writeText("e5vosdo.hu");
            redirect(window.location.href);
          }}
        >
          Cím másolása
        </Button>
      </ModalContent>
    </Modal>
  );
};

const SkipMessenger: React.FC = () => {
  const [isMessengerBrowser, setIsMessengerBrowser] = useState(false);

  useEffect(() => {
    setIsMessengerBrowser(checkMessengerBrowser());
  }, []);

  return (
    <>
      {isMessengerBrowser ? (
        <Modal isOpen={isMessengerBrowser}>
          <ModalContent className="p-5 text-center">
            <ModalHeader>Átirányítás...</ModalHeader>
            <p>
              A Messenger beépített böngészője nem támogatott. Az oldal
              megtekintéséhez használja a Google Chrome böngészőt vagy a
              Safari-t (iOS).
            </p>
            <p className="tegt-xl font-bold text-selfprimary">e5vosdo.hu</p>
            <Button
              onPress={() => {
                navigator.clipboard.writeText("e5vosdo.hu");
                redirect(window.location.href);
              }}
            >
              Cím másolása
            </Button>
          </ModalContent>
        </Modal>
      ) : null}
    </>
  );
};

export default SkipMessenger;
