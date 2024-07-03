import { redirect } from "next/navigation";
import Image from "next/image";
import LogOut from "@/components/LogOut";
import {
  apireq,
  getAdminUsersEmail,
  getAuth,
  getUsers,
  hasPermission,
} from "@/db/dbreq";
import ListUsers from "@/components/account/listusers";
import NewNotification from "@/components/account/notification";
import {
  DeleteServiceWorker,
  NewServiceWorker,
} from "@/components/PWA/managesw";
import { ButtonGroup } from "@nextui-org/react";

const AboutPage = async () => {
  const selfUser = await getAuth();
  const admins = await getAdminUsersEmail();
  if (!selfUser) redirect("/");

  return (
    <>
      <h1 className="pb-8 text-4xl lg:text-5xl font-semibold text-foreground text-center">
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
        <LogOut size="md" />
        <ButtonGroup>
          <DeleteServiceWorker />
          <NewServiceWorker />
        </ButtonGroup>
      </div>
      <div>{"Adminok: " + admins.join(", ")}</div>
      <br />
      <br />
      {(await hasPermission(selfUser.email, "getUsers")) ? (
        <ListUsers
          admins={admins}
          selfUser={selfUser}
          initialUsers={await getUsers()}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default AboutPage;
