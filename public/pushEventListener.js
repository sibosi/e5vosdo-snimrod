// pushEventListener.js
export default function registerPushEventListener() {
    window.addEventListener("push", (event) => {
        const data = event.data?.json();
        const notificationTitle = data?.title || "Default Title";
        const notificationOptions = {
            body: data?.body || "Default body",
            icon: data?.icon || "/path/to/default/icon.png",
            tag: data?.tag || "default-tag",
        };

        event.waitUntil(
            self.registration.showNotification(notificationTitle, notificationOptions)
        );
    });
}
