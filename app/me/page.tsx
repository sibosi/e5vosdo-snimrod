import { getAuth, hasPermission } from "@/db/dbreq";
import { Avatar, Link } from "@heroui/react";
import IDCard from "./IDCard";
import PleaseLogin from "./redirectToLogin";
import Tray from "@/components/tray";
import Settings from "./Settings";
import { LogoutBadge } from "@/components/LogOut";

const MePage = async () => {
  const selfUser = await getAuth();
  if (!selfUser) return <PleaseLogin />;

  const controlOptions: { title: string; href: string; access: boolean }[] = [
    {
      title: "Felhasználók",
      href: "/admin/users",
      access: await hasPermission(selfUser.email, "getUsers"),
    },
    {
      title: "Oldal",
      href: "/admin/page",
      access: await hasPermission(selfUser.email, "getUsers"),
    },
    {
      title: "Események",
      href: "/dev",
      access: selfUser.permissions.includes("admin"),
    },
    {
      title: "Parlamentek",
      href: "/parlament",
      access: selfUser.permissions.includes("head_of_parlament"),
    },
  ];

  return (
    <div className="space-y-4 lg:max-w-[50vw]">
      <div className="flex content-start items-center gap-4">
        <Avatar
          isBordered
          color="default"
          className="h-20 w-20"
          src={selfUser.image}
        />
        <div className="text-foreground">
          <h1 className="text-2xl font-semibold lg:text-5xl">
            {selfUser.name}
          </h1>
          <h2 className="flex items-center gap-2 text-lg font-light lg:text-2xl">
            <LogoutBadge />
            {selfUser.EJG_code && (
              <IDCard codeType="barcode" EJG_code={selfUser.EJG_code} />
            )}
          </h2>
        </div>
      </div>

      {controlOptions.some((option) => option.access) && (
        <Tray title="Kezelési lehetőségek" className="text-lg">
          <div className="flex flex-wrap justify-between gap-2">
            {controlOptions.map(
              (option) =>
                option.access && (
                  <Link
                    key={option.title}
                    href={option.href}
                    className="rounded-xl bg-selfsecondary-300 px-4 py-2.5 text-sm text-foreground"
                  >
                    {option.title}
                  </Link>
                ),
            )}
          </div>
        </Tray>
      )}

      <Settings selfUser={selfUser} />
    </div>
  );
};

export default MePage;
