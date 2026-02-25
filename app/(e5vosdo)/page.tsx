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
import Footer from "@/components/footer";
import { hasPermission } from "@/db/permissions";
import HeadTimetable from "@/components/home/smartHead/headTimetable";
import {
  QuickTeachers,
  QuickTeachersDev,
} from "@/components/helyettesites/quickteacher";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import ElectionsInstagramFeed from "@/components/events/ElectionsInstagramFeed";
import ServerSideTab from "@/components/home/ServerSideTab";

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

const PageHeadContent = ({
  selfUser,
  carouselEvents,
}: {
  selfUser: UserType | null | undefined;
  carouselEvents: Awaited<ReturnType<typeof getCarouselEvents>>;
}) => {
  const allowForEveryone = true;

  const ConditionalCarousel =
    selfUser?.permissions.includes("user") || allowForEveryone ? (
      <Carousel data={carouselEvents} />
    ) : (
      <></>
    );

  if (selfUser === null)
    return (
      <div className="space-y-4">
        {ConditionalCarousel}
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
        {ConditionalCarousel}
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

  return ConditionalCarousel;
};

export default async function Home() {
  const skipWelcome = (await cookies()).get("skipWelcome")?.value === "true";

  if (!skipWelcome) {
    const pageHeaders = await headers();
    const userAgent = pageHeaders.get("user-agent")?.toLowerCase() ?? "";
    const isBot =
      userAgent.toLowerCase().includes("google.com/bot.html") ||
      /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandex|semrush|ahrefs|mj12bot|seznambot|facebookexternalhit|twitterbot|linkedinbot|embedly|crawler|spider|\bbot\b/i.test(
        userAgent,
      );

    if (!isBot) redirect("/welcome");
  }

  const [selfUser, carouselEvents] = await Promise.all([
    getAuth(),
    getCarouselEvents(),
  ]);

  return (
    <div>
      <PageHeadContent selfUser={selfUser} carouselEvents={carouselEvents} />

      <ServerSideTab
        isSecret={!hasPermission(selfUser, "tester")}
        tabs={[
          {
            key: "home",
            label: "Főoldal",
            content: <MainContent selfUser={selfUser} />,
          },
          {
            key: "elections",
            label: "Kampány",
            content: <ElectionsInstagramFeed />,
          },
        ]}
      />

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

function MainContent({
  selfUser,
}: Readonly<{ selfUser: UserType | null | undefined }>) {
  return (
    <>
      {hasPermission(selfUser, "user") && (
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
    </>
  );
}
