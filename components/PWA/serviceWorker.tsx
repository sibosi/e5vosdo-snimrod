"use client";
import { useEffect } from "react";

function ServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
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
}

export default ServiceWorker;
