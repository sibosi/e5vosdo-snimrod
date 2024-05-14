"use client";
import { Button } from "@nextui-org/react";

export const Push = () => {
  function notifyMe() {
    navigator.serviceWorker.register("sw.js");

    const options = { tag: "user_alerts" };

    navigator.serviceWorker.ready.then((registration) => {
      registration.getNotifications(options).then((notifications) => {
        // do something with your notifications
      });
    });

    navigator.serviceWorker.register("sw.js");

    function showNotification() {
      Notification.requestPermission().then((result) => {
        if (result === "granted") {
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification("Vibration Sample", {
              body: "Buzz! Buzz!",
              icon: "../images/touch/chrome-touch-icon-192x192.png",
              tag: "vibration-sample",
            });
          });
        }
      });
    }

    showNotification();
    navigator.serviceWorker.startMessages();

    if (!("Notification" in window)) {
      // Check if the browser supports notifications
      alert("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
      // Check whether notification permissions have already been granted;
      // if so, create a notification
      // const notification = new Notification("hi");
      // …
    } else if (Notification.permission !== "denied") {
      // We need to ask the user for permission
      Notification.requestPermission().then((permission) => {
        // If the user accepts, let's create a notification
        if (permission === "granted") {
          // const notification = new Notification("hi");
          // …
        }
      });
    }
  }

  return (
    <div>
      <Button onClick={notifyMe}>Notify me!</Button>
    </div>
  );
};
