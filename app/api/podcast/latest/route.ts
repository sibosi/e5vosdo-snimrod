import { parseStringPromise } from "xml2js";
import axios from "axios";
import { PodcastItem } from "@/types/podcast";
import { NextResponse } from "next/server";

const RSS_FEED_URL = process.env.RSS_FEED_URL as string;

export async function GET() {
  try {
    const response = await axios.get(RSS_FEED_URL);
    const xmlData = response.data;

    const result = await parseStringPromise(xmlData, {
      explicitArray: false,
      mergeAttrs: true,
    });

    const channel = result.rss.channel;

    const latestItem = Array.isArray(channel?.item)
      ? channel.item[0]
      : channel?.item;

    if (!latestItem) {
      return NextResponse.json(
        { error: "No podcast episodes found" },
        { status: 404 },
      );
    }

    const podcastEpisode: PodcastItem = {
      title: latestItem.title,
      description: latestItem.description,
      link: latestItem.link,
      guid: latestItem.guid?._ || latestItem.guid,
      creator: latestItem["dc:creator"],
      pubDate: latestItem.pubDate,
      enclosure: {
        url: latestItem.enclosure.url,
        length: latestItem.enclosure.length,
        type: latestItem.enclosure.type,
      },
      summary: latestItem["itunes:summary"],
      explicit: latestItem["itunes:explicit"],
      duration: latestItem["itunes:duration"],
      image:
        latestItem["itunes:image"]?.href ||
        channel?.["itunes:image"]?.href ||
        "",
      season: latestItem["itunes:season"],
      episode: latestItem["itunes:episode"],
      episodeType: latestItem["itunes:episodeType"],
    };

    return NextResponse.json(podcastEpisode);
  } catch (error) {
    console.error("Error fetching latest podcast episode:", error);
    return NextResponse.json(
      { error: "Failed to fetch latest podcast episode" },
      { status: 500 },
    );
  }
}
