"use client";
import { addToast, Button, closeAll } from "@heroui/react";
import Link from "next/link";
import { useEffect, useRef } from "react";

const checkCookie = () => {
  if (typeof document !== "undefined") {
    return document.cookie.includes("cookieAccepted=true");
  }
  return false;
};

const Cookie = () => {
  const shownRef = useRef(false);

  useEffect(() => {
    if (shownRef.current || checkCookie()) {
      return;
    }

    shownRef.current = true;

    addToast({
      title: "Cookie szabályzat",
      classNames: {
        base: "flex flex-col gap-4 bg-selfsecondary-20 text-selfsecondary border-selfsecondary border-2",
      },
      hideIcon: true,
      description: (
        <Link href="/security">
          Az oldal használatával elfogadod a{" "}
          <span className="font-bold underline">
            Cookie-kal és az adatvédelemmel kapcsolatos irányelveinket.
          </span>
        </Link>
      ),
      endContent: (
        <div className="flex w-full gap-x-2">
          <Button
            color="secondary"
            size="sm"
            variant="bordered"
            onPress={acceptCookie}
            className="w-full"
          >
            Immel-ámmal elfogadom
          </Button>
          <Button
            color="secondary"
            size="sm"
            onPress={acceptCookie}
            className="w-full"
          >
            Elfogadom
          </Button>
        </div>
      ),
      timeout: 0,
      hideCloseButton: true,
    });
  }, []);

  const acceptCookie = () => {
    if (typeof document !== "undefined") {
      document.cookie =
        "cookieAccepted=true; max-age=31536000; path=/; samesite=lax";
      closeAll();
    }
  };

  return <></>;
};

export default Cookie;
