import type { Metadata } from "next";
import "@/styles/bgimage.css";
import { siteConfig } from "@/config/site";
import { MenuInSection } from "@/components/menza/menu";
import { getAuth, UserType } from "@/db/dbreq";
import Tray from "@/components/tray";
import LoginButton from "@/components/LoginButton";
import Carousel from "@/components/home/carousel";
import { Chip } from "@heroui/react";
import { getCarouselEvents } from "@/db/event";
import { Section } from "@/components/home/section";
import { Events } from "@/components/events";
import MillioLepes from "@/components/home/milliolepes";
import Footer from "@/components/footer";
import { gate } from "@/db/permissions";
import HeadTimetable from "@/components/home/smartHead/headTimetable";
import {
  QuickTeachers,
  QuickTeachersDev,
} from "@/components/helyettesites/quickteacher";
import RedirectToWelcome from "@/components/welcome/redirectToWelcome";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

const PageHeadContent = async ({
  selfUser,
}: {
  selfUser: UserType | null | undefined;
}) => {
  const allowForEveryone = true;

  if (selfUser?.permissions.includes("user") || allowForEveryone)
    return <Carousel data={await getCarouselEvents()} />;

  if (selfUser === null)
    return (
      <Tray>
        <h1 className="text-3xl font-bold text-selfprimary-900 md:text-4xl">
          Sajnáljuk, valamilyen hiba történt. Kérjük, próbáld újra később!
        </h1>
      </Tray>
    );

  return (
    <Tray className="mx-auto max-w-md">
      <h1 className="mb-2 text-3xl font-bold text-selfprimary-900 md:text-4xl">
        Hiányolsz valamit? <br />
        Netán a híreket? <br />
        <span className="bg-gradient-to-r from-selfprimary-900 to-selfsecondary-300 bg-clip-text text-transparent">
          Vagy az órarendedet?
        </span>
      </h1>
      <LoginButton />
    </Tray>
  );
};

export default async function Home() {
  const cookieStore = await cookies();
  const skipWelcome = cookieStore.get("skipWelcome")?.value === "true";

  if (!skipWelcome) redirect("/welcome");

  const selfUser = await getAuth();

  return (
    <div>
      <RedirectToWelcome isActive={!selfUser} />

      <PageHeadContent selfUser={selfUser} />

      {gate(selfUser, "user", "boolean") && (
        <Section
          title="Órarend"
          localStorageKey="Órarend2"
          dropdownable={true}
          defaultStatus="opened"
          savable={true}
          chip={
            <Chip color="secondary" size="sm">
              Nem hivatalos
            </Chip>
          }
        >
          <div className="max-w-md">
            <HeadTimetable selfUser={selfUser} />
          </div>
        </Section>
      )}

      <Section title="Millió lépés" dropdownable={true}>
        <MillioLepes />
      </Section>

      {siteConfig.pageSections["helyettesitesek"] != "hidden" && (
        <Section
          title={"Helyettesítések"}
          dropdownable={true}
          defaultStatus={siteConfig.pageSections["helyettesitesek"]}
          newVersion={<QuickTeachersDev />}
          oldVersionName="Lista"
          newVersionName="Rács"
        >
          <QuickTeachers />
        </Section>
      )}

      {siteConfig.pageSections["menza"] != "hidden" && (
        <MenuInSection selfUser={selfUser} />
      )}

      {siteConfig.pageSections["esemenyek"] != "hidden" && (
        <Section
          title="Események"
          dropdownable={true}
          defaultStatus={siteConfig.pageSections["esemenyek"]}
        >
          <Events />
        </Section>
      )}

      <Section title="Keresel valamit?" dropdownable={false}>
        <Footer />
      </Section>

      <p className="hidden text-center italic">„Bömbi a király”</p>
      <div className="hidden">
        {
          "Az oldal a Budapest V. Kerületi Eötvös József Gimnázium (más néven EJG) Diákönkormányzatának (más néven DÖ) tájékoztató oldala."
        }
      </div>
    </div>
  );
}
