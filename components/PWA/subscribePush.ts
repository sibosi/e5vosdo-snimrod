"use client";

const publicVapidKey =
  "BH7pxWz73TVKf6kND942hW_tEskJ_wmWJaGvSRrCSOccRIlTXumOOAfMadW-BrxdmCDyYaQScMBlHsfBohAG7oE";

export async function subscribePush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("A böngésződ nem támogatja a push értesítéseket.");
  }

  if (Notification.permission !== "granted") {
    throw new Error("A böngészőben nincs engedélyezve a push értesítés.");
  }

  const registration = await navigator.serviceWorker.ready;
  const existingSubscription = await registration.pushManager.getSubscription();
  const subscription =
    existingSubscription ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    }));

  const response = await fetch("/api/subscribe", {
    method: "POST",
    body: JSON.stringify(subscription),
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok)
    throw new Error("Nem sikerült bekapcsolni a push értesítést.");
}

export async function requestPushPermissionAndSubscribe() {
  if (!("Notification" in window)) {
    throw new Error("A böngésződ nem támogatja a push értesítéseket.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("A push értesítés engedélyezését elutasítottad.");
  }

  await subscribePush();
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index++) {
    outputArray[index] = rawData.charCodeAt(index);
  }
  return outputArray;
}
