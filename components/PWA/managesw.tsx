"use client";
import { Button } from "@nextui-org/react";
import React from "react";

export const DeleteServiceWorker = () => {
  const deleteServiceWorker = () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          for (let registration of registrations) {
            registration.unregister().then((boolean) => {
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

  return <Button onClick={deleteServiceWorker}>SW törlése</Button>;
};

export const NewServiceWorker = () => {
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

  return <Button onClick={registerServiceWorker}>Új SW</Button>;
};

export const ReinstallServiceWorker = () => {
  const deleteServiceWorker = () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          for (let registration of registrations) {
            registration.unregister().then((boolean) => {
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
      onClick={() => {
        deleteServiceWorker();
        registerServiceWorker();
        location.reload();
      }}
    >
      SW helyreállítása
    </Button>
  );
};
