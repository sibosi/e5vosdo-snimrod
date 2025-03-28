import Page from "./index";
import { headers } from "next/headers";

const E5PodcastPage = async () => {
  const _ = await headers();

  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/podcast`);
  if (!res.ok) {
    // handle error, optionally redirect or show an error message
  }
  const podcastData = await res.json();
  const lastFetched = new Date().toISOString();

  return <Page podcastData={podcastData} lastFetched={lastFetched} />;
};

export default E5PodcastPage;
