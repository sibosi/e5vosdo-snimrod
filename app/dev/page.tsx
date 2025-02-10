import { getAuth } from "@/db/dbreq";
import {
  ManageActiveEvents,
  ManagePreviewEvents,
} from "@/app/about/eventManager";
import PleaseLogin from "../me/redirectToLogin";

const AboutPage = async () => {
  const selfUser = await getAuth();
  if (!selfUser) return <PleaseLogin />;

  return (
    <>
      <h1 className="pb-8 text-center text-4xl font-semibold text-foreground lg:text-5xl">
        🚧 Dev 🚧
      </h1>
      <ManagePreviewEvents selfUser={selfUser} />
      <ManageActiveEvents selfUser={selfUser} />
    </>
  );
};

export default AboutPage;
