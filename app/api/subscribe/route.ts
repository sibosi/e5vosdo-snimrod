import { addPushAuth, addServiceWorker } from "@/db/dbreq";
import { NextRequest, NextResponse } from "next/server";
import webPush from "web-push";

const publicVapidKey = process.env.PUBLIC_VAPID_KEY as string;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY as string;

webPush.setVapidDetails(
  "mailto:spam.sibosi@gmail.com",
  publicVapidKey,
  privateVapidKey,
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
  console.log("Adding subscription:", subscriptionObj);
  console.log(await addServiceWorker(subscriptionObj));
  console.log(await addPushAuth(subscriptionObj.keys.auth));

  console.log("Subscription added:", subscriptionObj);

  const payload = JSON.stringify({
    title: "Az eszköz sikeresen azonosítva!",
    message: "Sikeres azonosítás!",
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
  return NextResponse.json({
    message: "GET requests are not supported",
  });
}
