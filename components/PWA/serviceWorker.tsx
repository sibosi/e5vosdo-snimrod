"use client";
import { useEffect } from "react";
import { chechForUpdate, updateVersion } from "./version";
import { useRouter } from "next/navigation";

function ServiceWorker() {
  const router = useRouter();

  useEffect(() => {
    const allowedDomains = ["info.e5vosdo.hu", "localhost"];
    const currentDomain = window.location.hostname;

    if (!allowedDomains.includes(currentDomain)) {
      router.push("https://info.e5vosdo.hu" + window.location.pathname);
    }
  }, [router]);

  useEffect(() => {
    // Service Worker is going to be registered.
    if ("serviceWorker" in navigator) {
      // Service Worker is supported.
      window.addEventListener("load", () => {
        // Service Worker is being registered.
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

      const interval = async () => {
        chechForUpdate().then((newNeedUpdate) => {
          if (newNeedUpdate.updateRequired) {
            updateVersion().then(() => {
              // window.location.reload();
            });
          }
        });
      };

      interval();
    }
  }, []);
  return null;
}

export default ServiceWorker;
