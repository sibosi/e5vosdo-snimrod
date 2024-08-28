"use strict";

function getDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('settingsDB', 1);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      reject(event);
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
    };
  });
}

async function writeStorage(id, value) {
  return getDb().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['settings'], 'readwrite');
      const objectStore = transaction.objectStore('settings');
      const request = objectStore.put({ id: id, value: value });

      request.onerror = (event) => {
        console.error('Error writing cache method to IndexedDB:', event);
        reject(event);
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  });
}

async function getStorage(id) {
  return getDb().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['settings'], 'readonly');
      const objectStore = transaction.objectStore('settings');
      const request = objectStore.get(id);

      request.onerror = (event) => {
        console.error('Error reading data from IndexedDB:', event);
        reject(event);
      };

      request.onsuccess = (event) => {
        resolve(event.target.result ? event.target.result.value : undefined);
      };
    });
  });
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

const CACHE_NAME = 'simple-cache'

self.addEventListener('install', (event) => {
  caches.keys().then((cacheNames) => {
    return Promise.all(
      cacheNames.map((cacheName) => {
        if (cacheName !== CACHE_NAME) {
          return caches.delete(cacheName);
        }
      })
    );
  })
});

const DISALLOWED_URLS = [
  '/api',
  '/me',
  '/about',
  '/admin',
  '/manifest.json',
  '/serviceWorker.js',
  '/sw.js'
]

const DISALLOWED_URL_BEGINNINGS = [
  '/api',
]

let cacheMethod = null;
(async () => cacheMethod = await getStorage('cacheMethod'))()

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const shouldDisallow = DISALLOWED_URLS.some((disallowedUrl) => {
    return event.request.url.includes(disallowedUrl);
  });

  const shouldDisallowBeginning = DISALLOWED_URL_BEGINNINGS.some((disallowedUrlBeginning) => {
    return event.request.url.startsWith(disallowedUrlBeginning);
  });

  if (shouldDisallow || shouldDisallowBeginning) {
    return;
  }

  event.respondWith(
    (async () => {
      const url = new URL(event.request.url);

      if (cacheMethod === null) {
        cacheMethod = await getStorage('cacheMethod');
        console.log('Chachce updated:', cacheMethod);
      }

      if (cacheMethod === 'never') return fetch(event.request);
      if (cacheMethod === 'offline' && navigator.onLine) return fetch(event.request);
      if (url.pathname.startsWith('/_next/image')) {
        const cache = await caches.open('dynamic-images-cache');
        const cachedResponse = await cache.match(event.request);

        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(event.request);
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        } catch (error) {
          console.error('Failed to fetch and cache image:', error);
          throw error;
        }
      } else {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);

        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(event.request);

          const shouldDisallow = DISALLOWED_URLS.some((disallowedUrl) => {
            return event.request.url.includes(disallowedUrl);
          });

          const shouldDisallowBeginning = DISALLOWED_URL_BEGINNINGS.some((disallowedUrlBeginning) => {
            return event.request.url.startsWith(disallowedUrlBeginning);
          });

          if (shouldDisallow || shouldDisallowBeginning) {
            return networkResponse;
          }

          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        } catch (error) {
          console.error('Fetch failed:', error);
          throw error;
        }
      }
    })()
  );
});



self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'updateCacheMethod') {
    writeStorage('cacheMethod', event.data.cacheMethod);
    console.log(`Cache method updated to: ${event.data.cacheMethod}`);
  }
  else if (event.data && event.data.action === 'reCache') {
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
