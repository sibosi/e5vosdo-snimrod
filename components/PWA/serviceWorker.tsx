"use client";
import { useEffect } from "react";
import { chechForUpdate, updateVersion } from "./version";

function ServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
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

      navigator.serviceWorker.addEventListener("error", (event) => {
        console.log("Service Worker error:", event);
      });

      navigator.serviceWorker.addEventListener("fetch", (event) => {
        console.log("Service Worker fetch:", event);
      });
    }
  }, []);
  return null;
}

export default ServiceWorker;
