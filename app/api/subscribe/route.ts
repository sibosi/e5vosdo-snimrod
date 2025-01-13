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

export async function POST(req: NextRequest) {
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
  // console.log("Adding subscription:", subscriptionObj);
  const response = await addPushAuth(subscriptionObj.keys.auth);
  console.log(response);
  if (response === true) {
    console.log("Subscription already exists");
    return NextResponse.json({
      status: 200,
      message: "Subscription already exists",
    });
  }
  console.log(await addServiceWorker(subscriptionObj));
  console.log("Subscription added:", subscriptionObj);

  return NextResponse.json({
    status: 201,
    message: "Subscription added",
  });
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: "GET requests are not supported",
  });
}
