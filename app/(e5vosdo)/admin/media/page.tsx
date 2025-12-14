import { redirect } from "next/navigation";
import { getAuth } from "@/db/dbreq";
import { gate } from "@/db/permissions";
import MediaAdminClient from "./MediaAdminClient";

export default async function MediaAdminPage() {
  const selfUser = await getAuth();
  if (!selfUser) redirect("/");

  try {
    gate(selfUser, "admin");
  } catch {
    redirect("/");
  }

  return <MediaAdminClient />;
}
