"use strict";

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
