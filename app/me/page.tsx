import { redirect } from "next/navigation";
import { getAuth } from "@/db/dbreq";
import { Avatar } from "@nextui-org/react";
import MySettings from "./mysettings";

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
      <MySettings selfUser={selfUser} />
    </>
  );
};

export default AboutPage;
