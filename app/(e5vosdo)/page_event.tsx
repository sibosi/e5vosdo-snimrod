import type { Metadata } from "next";
import "@/styles/bgimage.css";
import { siteConfig } from "@/config/site";
import { getAuth, UserType } from "@/db/dbreq";
import Tray from "@/components/tray";
import LoginButton from "@/components/LoginButton";
import { Section } from "@/components/home/section";
import Footer from "@/components/footer";
import ManageTeams from "./foca12h/promoBeforeEvent";

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

const ConditionalLogin = ({
  selfUser,
}: {
  selfUser: UserType | null | undefined;
}) => {
  if (selfUser === null)
    return (
      <div className="space-y-4">
        <Tray>
          <h1 className="text-3xl font-bold text-selfprimary-900 md:text-4xl">
            Sajnáljuk, valamilyen hiba történt. Kérjük, próbáld újra később!
          </h1>
        </Tray>
      </div>
    );

  if (selfUser === undefined)
    return (
      <div className="space-y-4">
        <Tray className="mx-auto max-w-md">
          <h1 className="mb-2 text-3xl font-bold text-selfprimary-900 md:text-4xl">
            Hiányolsz valamit? <br />
            <span className="bg-linear-to-r from-selfprimary-900 to-selfsecondary-300 bg-clip-text text-transparent">
              Netán az órarendedet?
            </span>
          </h1>
          <LoginButton />
        </Tray>
      </div>
    );

  return <></>;
};

export default async function Home() {
  const selfUser = await getAuth();

  return (
    <div>
      <ManageTeams areMultipleGroups={false} />

      <ConditionalLogin selfUser={selfUser} />
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
