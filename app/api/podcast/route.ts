import { parseStringPromise } from "xml2js";
import axios from "axios";
import { PodcastChannel } from "@/types/podcast";
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

    const podcastData: PodcastChannel = {
      title: channel.title,
      description: channel.description,
      link: channel.link,
      image: {
        url: channel.image.url,
        title: channel.image.title,
        link: channel.image.link,
      },
      author: channel.author,
      copyright: channel.copyright,
      language: channel.language,
      lastBuildDate: channel.lastBuildDate,
      items: Array.isArray(channel.item)
        ? channel.item.map((item: any) => ({
            title: item.title,
            description: item.description,
            link: item.link,
            guid: item.guid._ || item.guid,
            creator: item["dc:creator"],
            pubDate: item.pubDate,
            enclosure: {
              url: item.enclosure.url,
              length: item.enclosure.length,
              type: item.enclosure.type,
            },
            summary: item["itunes:summary"],
            explicit: item["itunes:explicit"],
            duration: item["itunes:duration"],
            image: item["itunes:image"]?.href || "",
            season: item["itunes:season"],
            episode: item["itunes:episode"],
            episodeType: item["itunes:episodeType"],
          }))
        : [
            {
              title: channel.item.title,
              description: channel.item.description,
              link: channel.item.link,
              guid: channel.item.guid._ || channel.item.guid,
              creator: channel.item["dc:creator"],
              pubDate: channel.item.pubDate,
              enclosure: {
                url: channel.item.enclosure.url,
                length: channel.item.enclosure.length,
                type: channel.item.enclosure.type,
              },
              summary: channel.item["itunes:summary"],
              explicit: channel.item["itunes:explicit"],
              duration: channel.item["itunes:duration"],
              image: channel.item["itunes:image"]?.href || "",
              season: channel.item["itunes:season"],
              episode: channel.item["itunes:episode"],
              episodeType: channel.item["itunes:episodeType"],
            },
          ],
    };

    return NextResponse.json(podcastData);
  } catch (error) {
    console.error("Error fetching podcast data:", error);
    return NextResponse.json(
      { error: "Failed to fetch podcast data" },
      { status: 500 },
    );
  }
}
