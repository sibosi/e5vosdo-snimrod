"use client";
import React, { useEffect, useState } from "react";
import { NotificationBox } from "./notificationBox";

const PushIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    fill="currentColor"
    className="bi bi-app-indicator"
    viewBox="0 0 16 16"
  >
    <path d="M5.5 2A3.5 3.5 0 0 0 2 5.5v5A3.5 3.5 0 0 0 5.5 14h5a3.5 3.5 0 0 0 3.5-3.5V8a.5.5 0 0 1 1 0v2.5a4.5 4.5 0 0 1-4.5 4.5h-5A4.5 4.5 0 0 1 1 10.5v-5A4.5 4.5 0 0 1 5.5 1H8a.5.5 0 0 1 0 1z" />
    <path d="M16 3a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />

    <text x="8" y="10" fontSize="5" fontWeight="bold" textAnchor="middle">
      DÖ
    </text>
  </svg>
);

const checkServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    await navigator.serviceWorker.getRegistrations().then((registrations) => {
      if (registrations.length === 0) {
        console.log("Service worker not registered");
        return false;
      } else {
        console.log("Service worker already registered");
        return true;
      }
    });
  } else {
    console.log("Service workers are not supported in this browser");
    return false;
  }
  return false;
};

export const checkIsPushEnabled = async () => {
  const registration = await navigator.serviceWorker.ready;
  console.log("Service Worker is registered");
  const existingSubscription = await registration.pushManager.getSubscription();

  return existingSubscription ? true : false;
};

export const EnablePushNotif = () => {
  const [isPushEnabled, setIsPushEnabled] = useState(false);

  useEffect(() => {
    checkIsPushEnabled().then((result) => {
      setIsPushEnabled(result);
    });
  }, []);
  return (
    <>
      {!isPushEnabled && (
        <NotificationBox
          icon={PushIcon}
          title="Push értesítések engedélyezése"
          body="Kérjük, engedélyezze a push értesítéseket!"
          // onClick={}
          color="warning"
        />
      )}
    </>
  );
};

export default EnablePushNotif;
