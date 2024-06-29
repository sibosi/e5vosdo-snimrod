// pages/api/subscribe.ts
import { m } from "framer-motion";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import webPush from "web-push";

const publicVapidKey = process.env.PUBLIC_VAPID_KEY as string; // Replace with your public VAPID key
const privateVapidKey = process.env.PRIVATE_VAPID_KEY as string; // Replace with your private VAPID key

webPush.setVapidDetails(
  "mailto:spam.sibosi@gmail.com", // Replace with your email
  publicVapidKey,
  privateVapidKey
);

export function POST(req: NextRequest, res: NextResponse) {
  const subscription = req.body as any;

  NextResponse.json({ status: 201 });

  const payload = JSON.stringify({
    title: "Test Notification",
    body: "This is a test notification",
  });

  webPush.sendNotification(subscription, payload).catch((error) => {
    console.error("Error sending notification:", error);
    return NextResponse.json({ status: 500, error: error });
  });
  return NextResponse.json({ status: 200, message: "Notification sent?" });
}

let subscriptions: any[] = [];
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
}
