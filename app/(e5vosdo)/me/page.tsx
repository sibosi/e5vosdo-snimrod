import { getAuth } from "@/db/dbreq";
import { Avatar, Link } from "@heroui/react";
import IDCard from "./IDCard";
import PleaseLogin from "./redirectToLogin";
import Tray from "@/components/tray";
import Settings from "./Settings";
import { hasPermission } from "@/db/permissions";

const MePage = async () => {
  const selfUser = await getAuth();
  if (!selfUser) return <PleaseLogin />;

  const controlOptions: { title: string; href: string; access: boolean }[] = [
    {
      title: "Felhasználók",
      href: "/admin/users",
      access: hasPermission(selfUser, "admin"),
    },
    {
      title: "Oldal",
      href: "/admin/page",
      access: hasPermission(selfUser, "admin"),
    },
    {
      title: "Prezentációk",
      href: "/jelentkezes/admin",
      access: hasPermission(selfUser, "admin"),
    },
    {
      title: "Események",
      href: "/dev",
      access: hasPermission(selfUser, "admin"),
    },
    {
      title: "Parlamentek",
      href: "/parlament",
      access: hasPermission(selfUser, "head_of_parlament"),
    },
    {
      title: "Mérkőzések",
      href: "/admin/matches",
      access: hasPermission(selfUser, "matchOrganiser"),
    },
    {
      title: "Előadások jelenléti íve",
      href: "/tanari/jelenletek",
      access: hasPermission(selfUser, "admin"),
    },
    {
      title: "Média admin",
      href: "/admin/media",
      access: hasPermission(selfUser, ["admin", "media_admin"]),
    },
    {
      title: "Rádió",
      href: "/keys/radio",
      access:
        selfUser.permissions.includes("radio_access"),
    },
     {
      title: "Höki",
      href: "/keys/hoki",
      access:
        selfUser.permissions.includes("hoki_access"),
    },
  ];

  return (
    <div className="space-y-4 lg:max-w-[50vw]">
      <div className="flex content-start items-center gap-4">
        <Avatar
          isBordered
          color="default"
          className="h-20 min-h-[80] w-20 min-w-[80px]"
          src={selfUser.image}
        />
        <div className="text-foreground">
          <h1 className="text-2xl font-semibold lg:text-5xl">
            {selfUser.name}
          </h1>
          <h2 className="flex flex-wrap items-center gap-2 text-lg font-light lg:text-2xl">
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
                    className="rounded-xl bg-selfsecondary-300 px-3 py-2 text-sm text-foreground"
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
