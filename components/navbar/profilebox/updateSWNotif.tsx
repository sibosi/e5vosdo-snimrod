"use client";
import React, { useEffect, useState } from "react";
import { NotificationBox } from "./notificationBox";

const SyncIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    fill="currentColor"
    className="bi bi-arrow-repeat"
    viewBox="0 0 16 16"
  >
    <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9" />
    <path
      fillRule="evenodd"
      d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z"
    />
  </svg>
);

const UpdateSWNotif = () => {
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

  return (
    <>
      {!isServiceWorkerRegistered ? (
        <NotificationBox
          icon={SyncIcon}
          title="Eszköz szinkronizálása"
          body="Kattints ide az eszköz szinkronizálásához!"
          onClick={async () => {
            await deleteServiceWorker();
            await registerServiceWorker();
            location.reload();
          }}
          className="rounded-2xl bg-success-100 text-success-700 px-1"
        />
      ) : null}
    </>
  );
};

export default UpdateSWNotif;
