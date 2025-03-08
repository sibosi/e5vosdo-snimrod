import { getAuth } from "@/db/dbreq";
import Player from "./player";
import { redirect } from "next/navigation";

const E5PodcastPage = async () => {
  const selfUser = await getAuth();

  if (!selfUser?.permissions.includes("tester")) redirect("/");

  return (
    <div className="font-semibold text-foreground">
      <div className="mb-8 text-center">
        <h1 className="pb-2 text-4xl lg:text-5xl">
          <span>Üdvözlünk </span>
          <span className="bg-gradient-to-l from-selfprimary-300 to-selfprimary-700 bg-clip-text text-transparent">
            {selfUser?.nickname ?? "minálunk"}
          </span>
          <span>!</span>
        </h1>
        <h2 className="quote text-lg italic">„Az Eötvös többet ad”</h2>
      </div>
      <div className="mx-auto max-w-fit">
        <Player />
      </div>
    </div>
  );
};

export default E5PodcastPage;
