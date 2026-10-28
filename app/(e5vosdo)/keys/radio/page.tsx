import Client from "../KeyClient";
import { hasPermission } from "@/db/permissions";
import { getAuth } from "@/db/dbreq";
import { redirect } from "next/navigation";
import CustomClient from "./CustomClient";
import { dbreq } from "@/db/presentationSignup";
import { Link } from "@heroui/react";

export default async function Page() {
  const selfUser = await getAuth();
  if (!selfUser) redirect("/");
  const hasAccess = hasPermission(selfUser, "radio_access");
  const isAdmin = hasPermission(selfUser, "radio_admin");
  const radio = await dbreq("SELECT * FROM radio_key_status");
  const radioStatus = radio[0];

  return (
    <div className="overflow-hidden">
      {hasAccess &&
        (radioStatus.borrowed == 0 || radioStatus.borrowed == 1) && (
          <Client
            borrowed={radioStatus.borrowed}
            borrowedBy={radioStatus.borrowed_by}
            borrowedAt={radioStatus.borrowed_at}
            name={selfUser.name}
            title="Rádiókulcs kölcsönzés"
            org="radio"
            svg={1}
          />
        )}
      {hasAccess && (
        <CustomClient
          isAdmin={isAdmin}
          status={radioStatus.borrowed}
          msg={radioStatus.borrowed_by}
        />
      )}
      <Link
        isExternal
        href="https://lbniko.com"
        title="Nikó oldala"
        className="bottom-30 absolute left-1/2 flex -translate-x-1/2 items-center gap-1 pb-14 text-current"
      >
        <span>Ezt az oldalt</span>
        <p className="text-selfprimary">Lengyel-Barsi Dominik</p>
        <span>fejlesztette</span>
      </Link>
    </div>
  );
}
