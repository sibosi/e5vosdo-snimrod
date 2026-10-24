import { redirect } from "next/navigation";
import { getAdminUsersEmail, getAuth, getUsers, UserType } from "@/db/dbreq";
import ManageUsers from "@/components/account/manageusers";
import { PERMISSIONS, hasPermission } from "@/db/permissions";

const UsersPage = async () => {
  const selfUser = await getAuth();
  const admins = await getAdminUsersEmail();
  if (!selfUser) redirect("/");

  const canManageUsers = hasPermission(selfUser, "admin");
  const users = canManageUsers ? await getUsers() : [];
  const permissions = Array.from(
    new Set([
      ...PERMISSIONS,
      ...users.flatMap((user: UserType) => user.permissions ?? []),
    ]),
  ).sort((a, b) => a.localeCompare(b, "hu"));

  return (
    <div className="space-y-4">
      <h1 className="pb-8 text-center text-4xl font-semibold text-foreground lg:text-5xl">
        Felhasználók
      </h1>

      <p>{"Adminok: " + admins.join(", ")}</p>

      {canManageUsers ? (
        <ManageUsers initialUsers={users} availablePermissions={permissions} />
      ) : (
        <></>
      )}
    </div>
  );
};

export default UsersPage;
