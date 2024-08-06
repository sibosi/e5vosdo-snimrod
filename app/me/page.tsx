import { redirect } from "next/navigation";
import { getAuth, hasPermission } from "@/db/dbreq";
import { Avatar } from "@nextui-org/react";
import MySettings from "./mysettings";
import ToManageButton from "./toManage";
import { has } from "cheerio/lib/api/traversing";
import IDCard from "./IDCard";

const AboutPage = async () => {
  const selfUser = await getAuth();
  if (!selfUser) redirect("/");

  return (
    <>
      <Avatar
        isBordered
        color="default"
        className="w-32 h-32 mx-auto"
        src={selfUser.image}
      />
      <h1 className="pt-3 pb-5 text-4xl lg:text-5xl font-semibold text-foreground text-center">
        Helló{" "}
        <p className="inline from-[#39b2f8] to-[#2747fc] bg-clip-text text-transparent bg-gradient-to-l">
          {selfUser.nickname}
        </p>
        !
      </h1>

      {(await hasPermission(selfUser.email, "getUsers")) ? (
        <div className="my-5">
          <div className="bg-gradient-to-r from-[#39b2f8] to-[#2747fc] mx-1 rounded-2xl p-2">
            <h2 className="text-2xl font-semibold text-foreground">
              Adminoknak és tesztelőknek
            </h2>
            <ToManageButton className="my-2" />
          </div>
        </div>
      ) : (
        <></>
      )}

      <IDCard EJG_code={selfUser.EJG_code} />

      <MySettings selfUser={selfUser} />
    </>
  );
};

export default AboutPage;
