import { getAuth } from "@/db/dbreq";
import { getChatWallMentionUsers, getChatWallMessages } from "@/lib/chat_wall";
import PleaseLogin from "../me/redirectToLogin";
import ChatWall from "./ChatWall";
import MaintenanceGate from "@/components/home/maintenanceGate";

const DevPage = async () => {
  const selfUser = await getAuth();
  if (!selfUser) return <PleaseLogin />;

  return (
    <MaintenanceGate isActive={true} selfUser={selfUser}>
      <h1 className="pb-8 text-center text-5xl font-semibold text-foreground max-lg:hidden">
        Fal
      </h1>
      <ChatWall
        initialMessages={await getChatWallMessages()}
        mentionUsers={await getChatWallMentionUsers()}
        pushPermission={selfUser.push_permission}
        pushAboutChatwall={selfUser.push_about_chatwall}
      />
    </MaintenanceGate>
  );
};

export default DevPage;
