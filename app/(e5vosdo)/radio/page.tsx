import Client from "./RadioClient";
import { hasPermission } from "@/db/permissions";
import { getAuth } from "@/db/dbreq";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";
import { dbreq } from "@/db/presentationSignup";

export default async function Page() {
  const selfUser = await getAuth();
  if (!selfUser) redirect("/");
  const hasAccess = hasPermission(selfUser, "radio_access");
  const radio = await dbreq("SELECT * FROM radio_key_status");
  const radioStatus = radio[0];

  return (
    <div className="overflow-hidden">
      {hasAccess && (
        <Client
          borrowed={radioStatus.borrowed}
          borrowedBy={radioStatus.borrowed_by}
          borrowedAt={radioStatus.borrowed_at}
          name={selfUser.name}
        />
      )}
    </div>
  );
}
