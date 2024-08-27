import { redirect } from "next/navigation";
import { getAuth, hasPermission } from "@/db/dbreq";
import { Avatar } from "@nextui-org/react";
import MySettings from "./mysettings";
import ToManageButton from "./toManage";
import IDCard from "./IDCard";
import VersionTable from "./versionTable";
import VersionManager from "@/components/PWA/versionManager";
import CacheManager from "@/components/PWA/cacheManager";

const AboutPage = async () => {
  const selfUser = await getAuth();
  if (!selfUser) redirect("/");

  return (
    <>
      <Avatar
        isBordered
        color="default"
        className="mx-auto h-32 w-32"
        src={selfUser.image}
      />
      <h1 className="pb-5 pt-3 text-center text-4xl font-semibold text-foreground lg:text-5xl">
        Helló{" "}
        <p className="inline bg-gradient-to-l from-[#39b2f8] to-[#2747fc] bg-clip-text text-transparent">
          {selfUser.nickname}
        </p>
        !
      </h1>

      {(await hasPermission(selfUser.email, "getUsers")) ? (
        <div className="my-5">
          <div className="bg-selfsecondary-100 mx-1 rounded-2xl bg-gradient-to-r p-3">
            <h2 className="text-2xl font-semibold text-foreground">
              Adminoknak és tesztelőknek
            </h2>
            <ToManageButton className="my-2" />
          </div>
        </div>
      ) : (
        <></>
      )}

      <IDCard EJG_code={selfUser.EJG_code} codeType="barcode" center={true} />

      <MySettings selfUser={selfUser} />
    </>
  );
};

export default AboutPage;
