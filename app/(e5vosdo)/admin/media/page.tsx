import { redirect } from "next/navigation";
import { getAuth } from "@/db/dbreq";
import { hasPermission } from "@/db/permissions";
import MediaAdminClient from "./MediaAdminClient";

export default async function MediaAdminPage() {
  const selfUser = await getAuth();
  if (!selfUser) redirect("/");

  if (!hasPermission(selfUser, ["admin", "media_admin"])) redirect("/");

  return <MediaAdminClient />;
}
