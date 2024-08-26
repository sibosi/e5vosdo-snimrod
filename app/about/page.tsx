import { redirect } from "next/navigation";
import Image from "next/image";
import { LogoutButton } from "@/components/LogOut";
import {
  apireq,
  getAdminUsersEmail,
  getAuth,
  getUsers,
  hasPermission,
} from "@/db/dbreq";
import ManageUsers from "@/components/account/manageusers";
import NewNotification from "@/components/account/notification";
import { ManageSW } from "@/components/PWA/managesw";

const AboutPage = async () => {
  const selfUser = await getAuth();
  const admins = await getAdminUsersEmail();
  if (!selfUser) redirect("/");

  return (
    <>
      <h1 className="pb-8 text-center text-4xl font-semibold text-foreground lg:text-5xl">
        🚧 About 🚧
      </h1>
      {(await hasPermission(selfUser.email, "getUsers")) ? (
        <NewNotification />
      ) : (
        <></>
      )}
      <h1>{selfUser.name}</h1>
      <div>
        {selfUser?.image && selfUser?.name && (
          <Image
            src={selfUser?.image}
            alt={selfUser?.name}
            width={72}
            height={72}
            className="rounded-full"
          />
        )}
      </div>
      <div className="inline-flex gap-2">
        <LogoutButton />

        <ManageSW />
      </div>
      <div>{"Adminok: " + admins.join(", ")}</div>
      <br />
      <br />
      {(await hasPermission(selfUser.email, "getUsers")) ? (
        <ManageUsers selfUser={selfUser} initialUsers={await getUsers()} />
      ) : (
        <></>
      )}
    </>
  );
};

export default AboutPage;
