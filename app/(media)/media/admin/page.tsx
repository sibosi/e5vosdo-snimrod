import { getAuth } from "@/db/dbreq";
import PleaseLogin from "@/app/(e5vosdo)/me/redirectToLogin";
import { gate } from "@/db/permissions";
import { redirect } from "next/navigation";
import MediaAdminPanel from "./MediaAdminPanel";

const MediaAdminPage = async () => {
  const selfUser = await getAuth();
  if (!selfUser) return <PleaseLogin />;

  const hasPermission = gate(selfUser, ["admin", "media_admin"], "boolean");
  if (!hasPermission) redirect("/media");

  return <MediaAdminPanel />;
};

export default MediaAdminPage;
