"use client";
import { Button } from "@nextui-org/react";
import React from "react";

export const ReinstallServiceWorker = () => {
  const deleteServiceWorker = async () => {
    if ("serviceWorker" in navigator) {
      await navigator.serviceWorker
        .getRegistrations()
        .then(async (registrations) => {
          for (let registration of registrations) {
            await registration.unregister().then((boolean) => {
              if (boolean) {
                console.log("Service worker unregistered");
              } else {
                console.log("Service worker could not be unregistered");
              }
            });
          }
          location.reload();
        })
        .catch((error) => {
          console.error("Error getting service worker registrations:", error);
        });
    } else {
      console.log("Service workers are not supported in this browser");
    }
  };

  const registerServiceWorker = async () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/serviceWorker.js")
        .then(async (registration) => {
          console.log(
            "Service worker registered with scope:",
            registration.scope
          );
          const response = await fetch("/api/subscribe", {
            method: "POST",
            body: JSON.stringify(registration),
            headers: {
              "Content-Type": "application/json",
            },
          });
          console.log("Subscribe response:", response);
        })
        .catch((error) => {
          console.error("Service worker registration failed:", error);
        });
    } else {
      console.log("Service workers are not supported in this browser");
    }
  };

  return (
    <Button
      onClick={async () => {
        await deleteServiceWorker();
        await registerServiceWorker();
        location.reload();
      }}
    >
      SW újratelepítése
    </Button>
  );
};
