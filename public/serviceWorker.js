"use strict";

const CACHE_NAME_BEGINNING = "simple-cache";
const CACHE_NAME = async () => {
  return (
    CACHE_NAME_BEGINNING +
    (await fetch("/manifest.json")
      .then((res) => res.json())
      .then((data) => data.version))
  );
};

const deleteOldCache = async () => {
  const cacheName = await CACHE_NAME();
  const cacheNames = await caches.keys();

  await Promise.all(
    cacheNames.map(async (oldCacheName) => {
      if (
        oldCacheName.startsWith(CACHE_NAME_BEGINNING) &&
        oldCacheName !== cacheName
      ) {
        await caches.delete(oldCacheName);
      }
    }),
  );
};

let lastChecked = 0;
const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes

function checkForUpdate() {
  const now = Date.now();

  if (now - lastChecked > CACHE_DURATION) {
    lastChecked = now;
    deleteOldCache();
  }
}

self.addEventListener("push", function (event) {
  let data = JSON.parse(event.data.text());
  const icon = data.icon ?? "/favicon.ico";
  data.icon = icon;
  event.waitUntil(registration.showNotification(data.title, data));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        if (clientList.length > 0) {
          let client = clientList[0];
          for (const clientItem of clientList) {
            if (clientItem.focused) {
              client = clientItem;
            }
          }
          return client.focus();
        }
        return clients.openWindow("/");
      }),
  );
});

const DISALLOWED_URLS = [
  "/api",
  "/about",
  "/admin",
  "/clearCache",
  "/manifest.json",
  "/me",
  "/serviceWorker.js",
];

const DISALLOWED_URL_BEGINNINGS = ["/api"];

self.addEventListener("fetch", (event) => {
  if (event.request.destination === "image")
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) return response;

        return fetch(event.request).then((response) => {
          const responseToCache = response.clone();
          caches.open("images").then((cache) => {
            const expirationTime = Date.now() + 1000 * 60 * 60 * 24 * 10; // 10 nap
            responseToCache.headers.append(
              "sw-expiration-time",
              expirationTime,
            );
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      }),
    );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.action === "reCache") {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
          }),
        );
      }),
    );
  }
});
