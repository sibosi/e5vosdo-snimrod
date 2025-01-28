import { getAuth, hasPermission } from "@/db/dbreq";
import { Avatar, Link } from "@nextui-org/react";
import MySettings from "./mysettings";
import IDCard from "./IDCard";
import PleaseLogin from "./redirectToLogin";
import TxtLiquid from "@/components/home/txtLiquid";
import Tray from "@/components/tray";

const AboutPage = async () => {
  const selfUser = await getAuth();
  if (!selfUser) return <PleaseLogin />;

  return (
    <div>
      <Avatar
        isBordered
        color="default"
        className="mx-auto h-32 w-32"
        src={selfUser.image}
      />
      <h1 className="pb-5 pt-3 text-center text-4xl font-semibold text-foreground lg:text-5xl">
        Helló{" "}
        <div className="inline bg-gradient-to-l from-selfprimary-300 to-selfprimary-700 bg-clip-text text-transparent">
          <TxtLiquid text={selfUser.nickname} />
        </div>
        !
      </h1>

      {(await hasPermission(selfUser.email, "getUsers")) ? (
        <Tray title="Felhasználók és oldal kezelése">
          <Link
            href="/about"
            className="rounded-xl bg-selfsecondary-300 px-4 py-2.5 text-sm text-foreground"
          >
            Az oldal kezelése
          </Link>
        </Tray>
      ) : null}

      {selfUser.permissions.includes("admin") ? (
        <Tray title="Események kezelése">
          <Link
            href="/dev"
            className="rounded-xl bg-selfsecondary-300 px-4 py-2.5 text-sm text-foreground"
          >
            Események kezelése
          </Link>
        </Tray>
      ) : null}

      {selfUser.permissions.includes("head_of_parlament") ? (
        <Tray title="Parlamentek kezelése">
          <Link
            href="/parlament"
            className="rounded-xl bg-selfsecondary-300 px-4 py-2.5 text-sm text-foreground"
          >
            Parlamentek kezelése
          </Link>
        </Tray>
      ) : null}

      <IDCard EJG_code={selfUser.EJG_code} codeType="barcode" center={true} />

      <MySettings selfUser={selfUser} />
    </div>
  );
};

export default AboutPage;
