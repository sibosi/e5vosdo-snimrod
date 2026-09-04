import type { Metadata } from "next";
import "@/styles/bgimage.css";
import { siteConfig } from "@/config/site";
import HomeGeneral from "./page_general";
import MaintenanceGate from "@/components/home/maintenanceGate";
import { getAuth } from "@/db/dbreq";

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

export default async function Page() {
  const selfUser = await getAuth();
  return (
    <HomeGeneral />
  );
}
