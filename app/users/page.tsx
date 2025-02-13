import { redirect } from "next/navigation";
import {
  getAdminUsersEmail,
  getAuth,
  getUsers,
  hasPermission,
} from "@/db/dbreq";
import ManageUsers from "@/components/account/manageusers";
import NewNotification from "@/components/account/notification";
import PageSettings from "@/components/pagesettings";
import { Section } from "@/components/home/section";

const UsersPage = async () => {
  const selfUser = await getAuth();
  const admins = await getAdminUsersEmail();
  if (!selfUser) redirect("/");

  return (
    <>
      <h1 className="pb-8 text-center text-4xl font-semibold text-foreground lg:text-5xl">
        Felhasználók
      </h1>
      {(await hasPermission(selfUser.email, "getUsers")) ? (
        <NewNotification />
      ) : (
        <></>
      )}
      <div>{"Adminok: " + admins.join(", ")}</div>
      <br />
      <br />

      {selfUser.permissions.includes("admin") ? (
        <Section
          title="Oldalbeállítások"
          dropdownable={true}
          defaultStatus="closed"
        >
          <PageSettings />
        </Section>
      ) : (
        <></>
      )}

      {(await hasPermission(selfUser.email, "getUsers")) ? (
        <ManageUsers selfUser={selfUser} initialUsers={await getUsers()} />
      ) : (
        <></>
      )}
    </>
  );
};

export default UsersPage;
