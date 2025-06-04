import Page from "./index";
import { headers } from "next/headers";
import { GET as getPodcastData } from "@/app/api/podcast/route";

const E5PodcastPage = async () => {
  const _ = await headers();

  const podcastData = await (await getPodcastData()).json();

  return <Page podcastData={podcastData} />;
};

export default E5PodcastPage;
