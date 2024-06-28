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

const AboutPage = async () => {
  const selfUser = await getAuth();
  const admins = await getAdminUsersEmail();
  if (!selfUser) redirect("/");

  return (
    <>
      <h1 className="pb-8 text-4xl lg:text-5xl font-semibold text-foreground text-center">
        🚧 About 🚧
      </h1>
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
      <LogOut />
      {"Adminok: " + admins.join(", ")}
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
