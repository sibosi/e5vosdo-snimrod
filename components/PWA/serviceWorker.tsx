"use client";
import { useEffect } from "react";
import { chechForUpdate, updateVersion } from "./version";

function ServiceWorker() {
  useEffect(() => {
    console.log("Service Worker is going to be registered.");
    if ("serviceWorker" in navigator) {
      console.log("Service Worker is supported.");
      window.addEventListener("load", () => {
        console.log("Service Worker is being registered.");
        navigator.serviceWorker.register("/serviceWorker.js").then(
          (registration) => {
            console.log(
              "ServiceWorker registration successful with scope: ",
              registration.scope,
            );
          },
          (error) => {
            console.log("ServiceWorker registration failed: ", error);
          },
        );
      });

      navigator.serviceWorker.addEventListener("push", async function (event) {
        console.log("Received a push message", event);

        var title = "Yay a message.";
        var body = "We have received a push message.";
        var icon = "/images/icon-192x192.png";
        var tag = "simple-push-demo-notification-tag";

        const registration = await navigator.serviceWorker.ready;

        (event as any).waitUntil(
          registration.showNotification(title, {
            body: body,
            icon: icon,
            tag: tag,
          }),
        );
      });

      navigator.serviceWorker.addEventListener("message", (event) => {
        console.log("Service Worker received message:", event);
      });

      navigator.serviceWorker.addEventListener("controllerchange", (event) => {
        console.log("Service Worker controller change:", event);
      });

      navigator.serviceWorker.addEventListener("statechange", (event) => {
        console.log("Service Worker state change:", event);
      });

      navigator.serviceWorker.addEventListener("updatefound", (event) => {
        console.log("Service Worker update found:", event);
      });

      navigator.serviceWorker.addEventListener("controllerchange", (event) => {
        console.log("Service Worker controller change:", event);
      });

      navigator.serviceWorker.addEventListener("error", (event) => {
        console.log("Service Worker error:", event);
      });

      navigator.serviceWorker.addEventListener("install", (event) => {
        console.log("Service Worker install:", event);
      });

      navigator.serviceWorker.addEventListener("activate", (event) => {
        console.log("Service Worker activate:", event);
      });

      navigator.serviceWorker.addEventListener("fetch", (event) => {
        console.log("Service Worker fetch:", event);
      });

      console.log("Service Worker got all of the events.");

      const interval = async () => {
        chechForUpdate().then((newNeedUpdate) => {
          if (newNeedUpdate.updateRequired) {
            updateVersion().then(() => {
              window.location.reload();
            });
          }
        });
      };

      interval();
    }
  }, []);
  return <></>;
}

export default ServiceWorker;
