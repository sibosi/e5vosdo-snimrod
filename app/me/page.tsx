import { getAuth, hasPermission } from "@/db/dbreq";
import { Avatar, Button, Link } from "@nextui-org/react";
import MySettings from "./mysettings";
import IDCard from "./IDCard";
import PleaseLogin from "./redirectToLogin";
import Tray from "@/components/tray";
import Settings from "./Settings";

const MePage = async () => {
  const selfUser = await getAuth();
  if (!selfUser) return <PleaseLogin />;

  return (
    <div className="space-y-4">
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
          <h2 className="text-lg font-light lg:text-2xl">{selfUser.email}</h2>
        </div>
      </div>

      <Tray title="Kezelési lehetőségek" className="text-lg">
        <div className="flex flex-wrap justify-between">
          {(await hasPermission(selfUser.email, "getUsers")) ? (
            <a href="/about">
              <Button className="bg-selfsecondary-300">
                Felhasználók és oldal
              </Button>
            </a>
          ) : null}

          {selfUser.permissions.includes("admin") ? (
            <Link
              href="/dev"
              className="rounded-xl bg-selfsecondary-300 px-4 py-2.5 text-sm text-foreground"
            >
              Események
            </Link>
          ) : null}

          {selfUser.permissions.includes("head_of_parlament") ? (
            <Link
              href="/parlament"
              className="rounded-xl bg-selfsecondary-300 px-4 py-2.5 text-sm text-foreground"
            >
              Parlamentek
            </Link>
          ) : null}
        </div>
      </Tray>

      <Settings selfUser={selfUser} />

      <div className="hidden">
        <IDCard EJG_code={selfUser.EJG_code} codeType="barcode" center={true} />

        <MySettings selfUser={selfUser} />
      </div>
    </div>
  );
};

export default MePage;
