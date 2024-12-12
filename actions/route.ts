"use server";

import { signIn, signOut } from "@/auth";

export async function doSocialLogin(formData: any) {
  const action = formData.get("action");
  await signIn(action, { redirectTo: process.env.APP_DOMAIN });
  console.log("Action");
}

export async function doLogout(formData: any) {
  await signOut({ redirectTo: "/" });
}
