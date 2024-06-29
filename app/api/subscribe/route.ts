// pages/api/subscribe.ts
import { NextRequest, NextResponse } from "next/server";
import webPush from "web-push";

const publicVapidKey = process.env.PUBLIC_VAPID_KEY as string; // Replace with your public VAPID key
const privateVapidKey = process.env.PRIVATE_VAPID_KEY as string; // Replace with your private VAPID key

webPush.setVapidDetails(
  "mailto:spam.sibosi@gmail.com", // Replace with your email
  publicVapidKey,
  privateVapidKey
);

let subscriptions: Array<any> = [];

export function POST(req: NextRequest, res: NextResponse) {
  const subscription = req.body as any;

  // Save the subscription to the subscriptions list
  subscriptions.push(subscription);

  const payload = JSON.stringify({
    title: "Test Notification",
    body: "This is a test notification",
  });

  webPush.sendNotification(subscription, payload).catch((error) => {
    console.error("Error sending notification:", error);
    return NextResponse.json({ status: 500, error: error });
  });

  return NextResponse.json({
    status: 201,
    message: "Subscription added and notification sent",
  });
}

export function GET(req: NextRequest, res: NextResponse) {
  const payload = JSON.stringify({
    title: "Test Notification",
    body: "This is a test notification",
  });

  const sendPromises = subscriptions.map((sub) =>
    webPush.sendNotification(sub, payload).catch((error) => {
      console.error("Error sending notification:", error);
    })
  );

  // Wait for all notifications to be sent
  Promise.all(sendPromises)
    .then(() => {
      return NextResponse.json({ status: 200, message: "Notifications sent" });
    })
    .catch((error) => {
      console.error("Error sending notifications:", error);
      return NextResponse.json({ status: 500, error: error });
    });
}
