"use strict";

const SW_settings_name = "SW-settings";

function getDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(SW_settings_name, 1);

    request.onerror = (event) => {
      console.error("IndexedDB error:", event);
      reject(event);
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "id" });
      }
    };
  });
}

async function writeStorage(id, value) {
  return await getDb().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["settings"], "readwrite");
      const objectStore = transaction.objectStore("settings");
      const request = objectStore.put({ id: id, value: value });

      request.onerror = (event) => {
        console.error("Error writing cache method to IndexedDB:", event);
        reject(event);
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  });
}

async function getStorage(id) {
  return await getDb().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["settings"], "readonly");
      const objectStore = transaction.objectStore("settings");
      const request = objectStore.get(id);

      request.onerror = (event) => {
        console.error("Error reading data from IndexedDB:", event);
        reject(event);
      };

      request.onsuccess = (event) => {
        resolve(event.target.result ? event.target.result.value : undefined);
      };
    });
  });
}

const CACHE_NAME_BEGINNING = "simple-cache-";
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
          for (let i = 0; i < clientList.length; i++) {
            if (clientList[i].focused) {
              client = clientList[i];
            }
          }
          return client.focus();
        }
        return clients.openWindow("/");
      }),
  );
});

self.addEventListener("install", (event) => {
  caches.keys().then((cacheNames) => {
    return Promise.all(
      cacheNames.map(async (cacheName) => {
        if (cacheName !== (await CACHE_NAME())) {
          return caches.delete(cacheName);
        }
      }),
    );
  });
});

const DISALLOWED_URLS = [
  "/api",
  "/about",
  "/admin",
  "/clearCache",
  "/manifest.json",
  "/me",
  "/serviceWorker.js",
  "/sw.js",
];

const DISALLOWED_URL_BEGINNINGS = ["/api"];

let cacheMethod = null;
(async () => (cacheMethod = await getStorage("cacheMethod")))();

self.addEventListener("nofetch", (event) => {
  checkForUpdate();
  if (event.request.method !== "GET") return;

  const shouldDisallow = DISALLOWED_URLS.some((disallowedUrl) => {
    return event.request.url.includes(disallowedUrl);
  });

  const shouldDisallowBeginning = DISALLOWED_URL_BEGINNINGS.some(
    (disallowedUrlBeginning) => {
      return event.request.url.startsWith(disallowedUrlBeginning);
    },
  );

  if (shouldDisallow || shouldDisallowBeginning) {
    return;
  }

  event.respondWith(
    (async () => {
      const url = new URL(event.request.url);

      if (url.pathname === "/clearCache")
        caches.keys().then((cacheNames) => {
          cacheNames.forEach((cacheName) => caches.delete(cacheName));
        });

      if (cacheMethod === null) {
        cacheMethod = await getStorage("cacheMethod");
        console.log("Chachce updated:", cacheMethod);
      }

      if (cacheMethod === "never") return fetch(event.request);
      if (cacheMethod === "offline" && navigator.onLine)
        return fetch(event.request);
      if (url.pathname.startsWith("/_next/image")) {
        const cache = await caches.open("dynamic-images-cache");
        const cachedResponse = await cache.match(event.request);

        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(event.request);
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        } catch (error) {
          console.error("Failed to fetch and cache image:", error);
          throw error;
        }
      } else {
        const cache = await caches.open(await CACHE_NAME());
        const cachedResponse = await cache.match(event.request);

        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(event.request);

          const shouldDisallow = DISALLOWED_URLS.some((disallowedUrl) => {
            return event.request.url.includes(disallowedUrl);
          });

          const shouldDisallowBeginning = DISALLOWED_URL_BEGINNINGS.some(
            (disallowedUrlBeginning) => {
              return event.request.url.startsWith(disallowedUrlBeginning);
            },
          );

          if (shouldDisallow || shouldDisallowBeginning) {
            return networkResponse;
          }

          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        } catch (error) {
          console.error("Fetch failed:", error);
          throw error;
        }
      }
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.action === "cacheMethodUpdated") {
    (async () => (cacheMethod = await getStorage("cacheMethod")))();
  }
  if (event.data && event.data.action === "reCache") {
    // Delete all cache

    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
          }),
        );
      }),
    );

    return;
  }
});
