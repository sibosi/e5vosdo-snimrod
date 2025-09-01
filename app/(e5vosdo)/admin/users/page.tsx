import { redirect } from "next/navigation";
import {
  getAdminUsersEmail,
  getAuth,
  getUsers,
  hasPermission,
} from "@/db/dbreq";
import ManageUsers from "@/components/account/manageusers";

const UsersPage = async () => {
  const selfUser = await getAuth();
  const admins = await getAdminUsersEmail();
  if (!selfUser) redirect("/");

  return (
    <div className="space-y-4">
      <h1 className="pb-8 text-center text-4xl font-semibold text-foreground lg:text-5xl">
        Felhasználók
      </h1>

      <p>{"Adminok: " + admins.join(", ")}</p>

      {(await hasPermission(selfUser.email, "getUsers")) ? (
        <ManageUsers initialUsers={await getUsers()} />
      ) : (
        <></>
      )}
    </div>
  );
};

export default UsersPage;
