export interface PodcastChannel {
  title: string;
  description: string;
  link: string;
  image: {
    url: string;
    title: string;
    link: string;
  };
  author: string;
  copyright: string;
  language: string;
  items: PodcastItem[];
  lastBuildDate?: string;
}

export interface PodcastItem {
  title: string;
  description: string;
  link: string;
  guid: string;
  creator: string;
  pubDate: string;
  enclosure: {
    url: string;
    length: string;
    type: string;
  };
  summary: string;
  explicit: string;
  duration: string;
  image: string;
  season?: string;
  episode?: string;
  episodeType: string;
}
