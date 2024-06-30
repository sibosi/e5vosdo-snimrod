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
      window.addEventListener("push", function (event: any) {
        console.log("Push event received:", event);

        let data: {
          title?: string;
          body?: string;
          icon?: string;
          badge?: string;
        } = {};
        if (event.data) {
          data = event.data.json();
        }

        const title = data.title || "Default title";
        const options = {
          body: data.body || "Default body",
          icon: data.icon || "/icon-144-144.png",
          badge: data.badge || "/icon-144-144.png",
        };

        event.waitUntil(
          (window as any).registration.showNotification(title, options)
        );
      });

      window.addEventListener("notificationclick", function (event: any) {
        console.log("Notification click received:", event);

        event.notification.close();

        try {
          event.waitUntil(
            (window as any).clients.openWindow("https://info.e5vosdo.hu")
          );
        } catch (error) {
          console.error("Error opening window:", error);
        }
      });
      console.log("Service Worker got all of the events.");
    }
  }, []);
  return <> </>;
}

export default ServiceWorker;
