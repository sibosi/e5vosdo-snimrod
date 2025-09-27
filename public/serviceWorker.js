"use strict";

const VERSION = "0.0.2509.0.4";

self.addEventListener("install", (event) => {
  console.log(`Service Worker version ${VERSION} installing...`);
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  console.log("Push event received:", event);
  if (!(self.Notification && self.Notification.permission === "granted"))
    return;
  console.log(
    "Push event with data:",
    event.data ? event.data.text() : "No data",
  );

  try {
    const data = event.data ? event.data.json() : {};

    const title = data.title || "Értesítés";
    const notificationOptions = {
      body: data.body || "",
      icon: data.icon || "/favicon.ico",
      badge: data.badge || undefined,
      data: data.data || {},
      tag: data.tag,
      renotify: !!data.renotify,
      actions: Array.isArray(data.actions) ? data.actions : undefined,
      vibrate: Array.isArray(data.vibrate) ? data.vibrate : undefined,
      requireInteraction: !!data.requireInteraction,
      silent: !!data.silent,
      timestamp: data.timestamp ? Date.now() : undefined,
      image: data.image || undefined,
    };

    self.registration.showNotification(title, notificationOptions);
  } catch (error) {
    console.error("Push event error:", error);
    try {
      self.registration.showNotification("Új értesítés");
    } catch (e) {
      console.error("Nem sikerült fallback notit sem megjeleníteni:", e);
    }
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.focused) {
            return client.focus();
          }
        }
        return clients.openWindow("/");
      }),
  );
});
