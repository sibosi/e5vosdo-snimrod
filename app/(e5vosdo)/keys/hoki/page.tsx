import Client from "../KeyClient";
import { hasPermission } from "@/db/permissions";
import { getAuth } from "@/db/dbreq";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";
import { dbreq } from "@/db/presentationSignup";

export default async function Page() {
  const selfUser = await getAuth();
  if (!selfUser) redirect("/");
  const hasAccess = hasPermission(selfUser, "hoki_access");
  const hoki = await dbreq("SELECT * FROM hoki_key_status");
  const hokiStatus = hoki[0];

  return (
    <div className="overflow-hidden">
      {hasAccess && (
        <Client
          borrowed={hokiStatus.borrowed}
          borrowedBy={hokiStatus.borrowed_by}
          borrowedAt={hokiStatus.borrowed_at}
          name={selfUser.name}
          title="Höki kulcs kölcsönzés"
          table="hoki_key_status"
          logTable="hoki_key_logs"
          permission="hoki_access"
          svg={2}
        />
      )}
    </div>
  );
}
