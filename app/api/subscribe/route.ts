// pages/api/subscribe.ts
import { addServiceWorker, getServiceWorkersByPermission } from "@/db/dbreq";
import { NextRequest, NextResponse } from "next/server";
import webPush from "web-push";

const publicVapidKey = process.env.PUBLIC_VAPID_KEY as string; // Replace with your public VAPID key
const privateVapidKey = process.env.PRIVATE_VAPID_KEY as string; // Replace with your private VAPID key

webPush.setVapidDetails(
  "mailto:spam.sibosi@gmail.com", // Replace with your email
  publicVapidKey,
  privateVapidKey
);

export async function POST(req: NextRequest, res: NextResponse) {
  const { value: subscription } = (await req.body?.getReader().read()) as {
    value: Uint8Array;
  };
  const subscriptionObj = JSON.parse(new TextDecoder().decode(subscription));

  if (!subscriptionObj || !subscriptionObj.endpoint) {
    return NextResponse.json({
      status: 400,
      error: "Subscription with a valid endpoint is required",
    });
  }

  // Save the subscription to the subscriptions list
  console.log(await addServiceWorker(JSON.stringify(subscriptionObj))));

  console.log("Subscription added:", subscriptionObj);

  const payload = JSON.stringify({
    title: "Írj Nimródnak: a #1 működik",
    body: "Ha ezt látod, írj Simon Nimródnak, hogy a #1 működik!",
  });

  try {
    console.log("Sending notification to:", subscriptionObj);
    await webPush.sendNotification(subscriptionObj, payload);
    return NextResponse.json({
      status: 201,
      message: "Subscription added and notification sent",
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json({ status: 500, error: error });
  }
}

export async function GET(req: NextRequest, res: NextResponse) {
  const payload = JSON.stringify({
    title: "Írj Nimródnak: a #1 működik",
    body: "Ha ezt látod, írj Simon Nimródnak, hogy a #1 működik!",
  });

  const subscriptions = await getServiceWorkersByPermission("student");

  console.log("Subscriptions len:", subscriptions.length);
  const subscriptionsList = subscriptions;
  subscriptionsList.reverse();

  const sendPromises = subscriptionsList.map(async (sub) => {
    try {
      console.log("Sending notification to:", sub);
      const result = await webPush
        .sendNotification(sub, payload)
        .catch((error) => {
          console.error("Error sending notification:", error);
        });
      console.log("Notification sent:", result);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  });

  // Wait for all notifications to be sent
  Promise.all(sendPromises)
    .then(() => {
      return NextResponse.json({ status: 200, message: "Notifications sent" });
    })
    .catch((error) => {
      console.error("Error sending notifications:", error);
      return NextResponse.json({ status: 500, error: error });
    });

  return NextResponse.json({ status: 200, message: "Notifications sent" });
}
