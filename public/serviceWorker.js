"use strict";

const CACHE_NAME_PREFIX = "simple-cache";

const getCacheName = async () => {
  try {
    const response = await fetch("/manifest.json");
    const data = await response.json();
    return `${CACHE_NAME_PREFIX}-${data.version}`;
  } catch (error) {
    console.error("Failed to fetch manifest.json:", error);
    return CACHE_NAME_PREFIX;
  }
};

const deleteOldCaches = async () => {
  const currentCacheName = await getCacheName();
  const cacheNames = await caches.keys();

  await Promise.all(
    cacheNames.map(async (cacheName) => {
      if (
        cacheName.startsWith(CACHE_NAME_PREFIX) &&
        cacheName !== currentCacheName
      ) {
        await caches.delete(cacheName);
      }
    }),
  );
};

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
let lastCacheCheck = 0;

const validateCache = () => {
  const now = Date.now();
  if (now - lastCacheCheck > CACHE_DURATION) {
    lastCacheCheck = now;
    deleteOldCaches();
  }
};

self.addEventListener("push", (event) => {
  try {
    const data = event.data ? JSON.parse(event.data.text()) : {};
    const notificationOptions = {
      ...data,
      icon: data.icon || "/favicon.ico",
    };
    event.waitUntil(
      self.registration.showNotification(
        data.title || "Notification",
        notificationOptions,
      ),
    );
  } catch (error) {
    console.error("Error handling push event:", error);
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

const DISALLOWED_URLS = [
  "/api",
  "/about",
  "/admin",
  "/clearCache",
  "/manifest.json",
  "/me",
  "/serviceWorker.js",
];

self.addEventListener("fetch", (event) => {
  const requestURL = new URL(event.request.url);

  if (DISALLOWED_URLS.includes(requestURL.pathname)) return;

  if (event.request.destination === "image") {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((networkResponse) => {
            if (
              !networkResponse ||
              networkResponse.status < 200 ||
              networkResponse.status > 599
            ) {
              throw new RangeError(
                `Invalid response status: ${networkResponse.status}`,
              );
            }

            const responseClone = networkResponse.clone();
            const expirationTime = Date.now() + 10 * 24 * 60 * 60 * 1000; // 10 days

            const responseToCache = new Response(responseClone.body, {
              status: networkResponse.status,
              statusText: networkResponse.statusText,
              headers: {
                ...Object.fromEntries(networkResponse.headers.entries()),
                "sw-expiration-time": expirationTime.toString(),
              },
            });

            caches.open("images").then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return networkResponse;
          })
          .catch((error) => {
            console.error("Fetch failed:", error);
            return new Response("Image not available", {
              status: 503,
              statusText: "Service Unavailable",
            });
          });
      }),
    );
  }
});

self.addEventListener("message", (event) => {
  if (event.data?.action === "reCache") {
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) =>
          Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName))),
        ),
    );
  }
});

setInterval(validateCache, CACHE_DURATION);
