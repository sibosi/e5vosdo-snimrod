import { redirect } from "next/navigation";
import { getAuth } from "@/db/dbreq";
import { gate } from "@/db/permissions";
import MediaAdminClient from "./MediaAdminClient";

export default async function MediaAdminPage() {
  const selfUser = await getAuth();
  if (!selfUser) redirect("/");

  const hasPermission = gate(selfUser, ["admin", "media_admin"], "boolean");
  if (!hasPermission) redirect("/");

  return <MediaAdminClient />;
}
