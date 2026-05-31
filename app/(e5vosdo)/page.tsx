import type { Metadata } from "next";
import "@/styles/bgimage.css";
import { siteConfig } from "@/config/site";
import HomeGeneral from "./page_general";
import HomeEvent from "./page_event";

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: siteConfig.links.home,
  },
};

export default function Page() {
  return (
    <>
      <HomeGeneral/>
      <HomeEvent/>
    </>
  );
}
