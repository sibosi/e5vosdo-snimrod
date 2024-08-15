"use client";
import {
  Button,
  ButtonGroup,
  Modal,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import React, { useEffect, useState } from "react";

export const ReinstallServiceWorker = () => {
  const [isServiceWorkerRegistered, setIsServiceWorkerRegistered] =
    useState(false);

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
            registration.scope,
          );
          const response = await fetch("/api/subscribe", {
            method: "POST",
            body: JSON.stringify(registration),
            headers: {
              "Content-Type": "application/json",
            },
          });
          console.log("Subscribe response:", response);
          setIsServiceWorkerRegistered(true);
        })
        .catch((error) => {
          console.error("Service worker registration failed:", error);
        });
    } else {
      console.log("Service workers are not supported in this browser");
    }
  };

  const checkServiceWorker = async () => {
    if ("serviceWorker" in navigator) {
      await navigator.serviceWorker.getRegistrations().then((registrations) => {
        if (registrations.length === 0) {
          console.log("Service worker not registered");
          setIsServiceWorkerRegistered(false);
          registerServiceWorker();
        } else {
          console.log("Service worker already registered");
          setIsServiceWorkerRegistered(true);
        }
      });
    } else {
      console.log("Service workers are not supported in this browser");
    }
  };

  useEffect(() => {
    checkServiceWorker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [showSWDetails, setShowSWDetails] = useState(false);
  const [subscription, setSubscription] = useState<any>();

  useEffect(() => {
    (async () => {
      const registration = await navigator.serviceWorker.ready;
      console.log("Service Worker is registered");
      const existingSubscription =
        await registration.pushManager.getSubscription();
      setSubscription(existingSubscription);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-full">
      <div>
        <ButtonGroup>
          <Button
            color={isServiceWorkerRegistered ? "success" : "danger"}
            onClick={async () => {
              await deleteServiceWorker();
              await registerServiceWorker();
              location.reload();
            }}
          >
            SW újratelepítése
          </Button>
          <Button onClick={() => setShowSWDetails(!showSWDetails)}>
            SW részletek
          </Button>
        </ButtonGroup>
      </div>

      <Modal isOpen={showSWDetails} onClose={() => setShowSWDetails(false)}>
        <ModalContent className="p-4">
          <ModalHeader>Service Worker részletek</ModalHeader>
          <p>{JSON.stringify(subscription)}</p>

          <Button
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(subscription));
            }}
          >
            Másolás
          </Button>
        </ModalContent>
      </Modal>
    </div>
  );
};
