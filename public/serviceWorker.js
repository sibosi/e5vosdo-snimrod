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

const CACHE_NAME = 'cache ' + Date.now();

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/clubs',

        '/favicon.ico',
        '/bimun.jpg',
        '/debate.png',
        '/diak.jpg',
        '/eam.png',
        '/elsosegely.jpg',
        '/kektura.jpg',
        '/kosar.jpg',
        '/media.jpg',
        '/munclub.png',
        '/nekunkx.png',
        '/sakk.jpg',
        '/suliradio.png',
        '/szinjatszo.png',
        '/tarsastar.png',
        '/technikusi.png',
        '/techteam.jpg',
        '/zoldbiz.png',

        // További statikus erőforrások hozzáadása itt
      ]);
    })
  );
});

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

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((networkResponse) => {
        return caches.open('my-app-cache').then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});
