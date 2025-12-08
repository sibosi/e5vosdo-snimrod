"use strict";

const VERSION = "0.0.2512.1.1";

const IMAGE_CACHE_NAME = "images-v1";
const IMAGE_META_CACHE_NAME = "images-meta-v1";
const IMAGE_TTL_MS = 48 * 60 * 60 * 1000; // 48h

self.addEventListener("install", (event) => {
  console.log(`Service Worker version ${VERSION} installing...`);
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

function isImageRequest(request) {
  try {
    if (request.headers?.get("Content-Type")?.includes("image/")) return true;
  } catch {}
  return false;
}

function metaRequestFor(url) {
  return new Request(`${url}::meta`, { method: "GET" });
}

async function updateImageCache(request, cache, metaCache) {
  try {
    const networkResponse = await fetch(request, { cache: "no-store" });
    if (
      networkResponse &&
      (networkResponse.ok || networkResponse.type === "opaque")
    ) {
      await cache.put(request, networkResponse.clone());
      await metaCache.put(
        metaRequestFor(request.url),
        new Response(JSON.stringify({ ts: Date.now() }), {
          headers: { "content-type": "application/json" },
        }),
      );
    }
  } catch {}
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (!isImageRequest(request)) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(IMAGE_CACHE_NAME);
      const metaCache = await caches.open(IMAGE_META_CACHE_NAME);

      const cached = await cache.match(request);
      if (cached) {
        let fresh = false;
        try {
          const metaResp = await metaCache.match(metaRequestFor(request.url));
          if (metaResp) {
            const data = await metaResp.json();
            if (data && typeof data.ts === "number") {
              fresh = Date.now() - data.ts < IMAGE_TTL_MS;
            }
          }
        } catch {}

        if (!fresh)
          event.waitUntil(updateImageCache(request, cache, metaCache));

        return cached;
      }

      try {
        const response = await fetch(request);
        if (response && (response.ok || response.type === "opaque")) {
          await cache.put(request, response.clone());
          await metaCache.put(
            metaRequestFor(request.url),
            new Response(JSON.stringify({ ts: Date.now() }), {
              headers: { "content-type": "application/json" },
            }),
          );
        }
        return response;
      } catch {
        return Response.error();
      }
    })(),
  );
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
      badge: data.badge || "/icons/96-transparent.png",
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
        return clients.openWindow(event.notification.data?.url || "/");
      }),
  );
});
