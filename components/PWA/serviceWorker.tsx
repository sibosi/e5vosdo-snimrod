"use client";
import { useEffect } from "react";

function ServiceWorker() {
  useEffect(() => {
    console.log("Service Worker is going to be registered.");
    if ("serviceWorker" in navigator) {
      console.log("Service Worker is supported.");
      window.addEventListener("load", () => {
        console.log("Service Worker is being registered.");
        navigator.serviceWorker.register("/sw.js").then(
          (registration) => {
            console.log(
              "ServiceWorker registration successful with scope: ",
              registration.scope
            );
          },
          (error) => {
            console.log("ServiceWorker registration failed: ", error);
          }
        );
      });
    }
  }, []);
  return <> </>;
}

export default ServiceWorker;
