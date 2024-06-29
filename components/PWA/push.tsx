"use client";
import { useEffect } from "react";

const publicVapidKey =
  "BH7pxWz73TVKf6kND942hW_tEskJ_wmWJaGvSRrCSOccRIlTXumOOAfMadW-BrxdmCDyYaQScMBlHsfBohAG7oE"; // Replace with your public VAPID key

async function subscribeUser() {
  if ("serviceWorker" in navigator && "PushManager" in window) {
    try {
      console.log("Registering service worker");
      const registration = await navigator.serviceWorker.ready;
      console.log("Service worker is registered");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });

      console.log("User is subscribed:", subscription);

      await fetch("/api/subscribe", {
        method: "POST",
        body: JSON.stringify(subscription),
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("User is subscribed:", subscription);
    } catch (error) {
      console.error("Failed to subscribe the user: ", error);
    }
  } else {
    console.warn("Push messaging is not supported");
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const PushManagerComponent = () => {
  self.addEventListener("install", () => {
    console.log("service worker installed");
  });

  self.addEventListener("activate", () => {
    console.log("service worker activated");
  });
  window.addEventListener("load", () => {
    if ("serviceWorker" in navigator) {
      console.log("Registering service worker from push manager");
      navigator.serviceWorker.register("/sw.js");
      console.log("Service worker registered");
    }
  });
  useEffect(() => {
    console.log("PushManagerComponent mounted");
    subscribeUser();
  }, []);

  return null;
};

export default PushManagerComponent;
