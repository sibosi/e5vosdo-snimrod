"use strict";

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

const CACHE_NAME = 'simple-cache'

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

const DISALLOWED_URLS = [
  '/api',
  '/me',
  '/manifest.json'
]

const DISALLOWED_URL_BEGINNINGS = [
  '/api',
]

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/_next/image')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Ha a kép már cache-elve van, visszaadjuk a cache-ből
        if (response) {
          return response;
        }

        // Ha nincs cache-elve, letöltjük és elmentjük a cache-be
        return fetch(event.request).then((networkResponse) => {
          return caches.open('dynamic-images-cache').then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }).catch((error) => {
          console.error('Failed to fetch and cache image:', error);
          throw error;
        });
      })
    );
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((networkResponse) => {

        const shouldDisallow = DISALLOWED_URLS.some((disallowedUrl) => {
          return event.request.url.includes(disallowedUrl);
        });

        const shouldDisallowBeginning = DISALLOWED_URL_BEGINNINGS.some((disallowedUrlBeginning) => {
          return event.request.url.startsWith(disallowedUrlBeginning);
        })

        if (shouldDisallow || shouldDisallowBeginning) {
          return networkResponse;
        }

        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
    })
  );
});


self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'reCache') {
    // Update the cache

    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        // 1. Store cache URLs
        return cache.keys().then((requests) => {
          const urlsToReCache = requests.map(request => request.url);

          // 2. Delete old cache
          return caches.delete(CACHE_NAME).then(() => {
            return caches.open(CACHE_NAME).then((newCache) => {

              // 3. Re-cache URLs
              return Promise.all(
                urlsToReCache.map((url) => {
                  return fetch(url).then((response) => {
                    if (response.ok) {
                      return newCache.put(url, response);
                    }
                    console.warn(`Fetching ${url} failed during re-cache.`);
                  }).catch((error) => {
                    console.error(`Error fetching ${url} during re-cache:`, error);
                  });
                })
              );
            });
          });
        });
      })
    );

    fetch('/manifest.json').then((response) => {
      return response.json();
    }).then((manifest) => {
      localStorage.setItem('version', manifest.version);
    });
  }
});
