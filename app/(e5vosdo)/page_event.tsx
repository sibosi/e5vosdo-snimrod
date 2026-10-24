import type { Metadata } from "next";
import "@/styles/bgimage.css";
import { siteConfig } from "@/config/site";
import { getAuth } from "@/db/dbreq";
import Tray from "@/components/tray";
import LoginButton from "@/components/LoginButton";
import { Section } from "@/components/home/section";
import Footer from "@/components/footer";
import MyPresentations from "@/components/home/myPresentations";
import { MenuInSection } from "@/components/menza/menu";
import { Events } from "@/components/events";

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

export default async function Home() {
  const selfUser = await getAuth();

  return (
    <div className="space-y-2">
      <Section
        title="Az én prezentációim"
        defaultStatus="opened"
        dropdownable={false}
      >
        {selfUser ? (
          <MyPresentations />
        ) : (
          <Tray className="mx-auto max-w-md">
            <h1 className="mb-2 text-2xl font-bold text-selfprimary-900">
              Jelentkezz be a prezentációid megtekintéséhez!
            </h1>
            <LoginButton />
          </Tray>
        )}
      </Section>

      <MenuInSection selfUser={selfUser} dropdownable={false} />

      <Section title="Események" dropdownable={false}>
        <Events />
      </Section>

      <Section title="Keresel valamit?" dropdownable={false}>
        <Footer />
      </Section>
      <div className="hidden">
        {
          "Az oldal a Budapest V. Kerületi Eötvös József Gimnázium (más néven EJG) Diákönkormányzatának (más néven DÖ) tájékoztató oldala."
        }
      </div>
    </div>
  );
}
