import "@/styles/bgimage.css";
import { siteConfig } from "@/config/site";
import {
  QuickTeachers,
  QuickTeachersDev,
} from "@/components/helyettesites/quickteacher";
import { MenuInSection } from "@/components/menza/menu";
import { Section } from "@/components/home/section";
import { Events } from "@/components/events";
import { getAuth, UserType } from "@/db/dbreq";
import Tray from "@/components/tray";
import LoginButton from "@/components/LoginButton";
import Footer from "@/components/footer";
import Carousel from "@/components/home/carousel";
import { gate } from "@/db/permissions";
import HeadTimetable from "@/components/home/smartHead/headTimetable";
import { Alert, Chip } from "@heroui/react";
import { getCarouselEvents } from "@/db/event";
import MillioLepes from "@/components/home/milliolepes";
import MyPresentations from "@/components/home/myPresentations";
import ProgramBlock from "@/components/home/programBlock";

const PageHeadContent = async ({
  selfUser,
}: {
  selfUser: UserType | null | undefined;
}) => {
  if (selfUser?.permissions.includes("user"))
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
    <Tray>
      <h1 className="text-3xl font-bold text-selfprimary-900 md:text-4xl">
        Hiányolsz valamit? <br />
        Netán a híreket? <br />
        <span className="bg-gradient-to-r from-selfprimary-900 to-selfsecondary-300 bg-clip-text text-transparent">
          Vagy az órarendedet?
        </span>
        <LoginButton />
      </h1>
    </Tray>
  );
};

export default async function Home() {
  const selfUser = await getAuth();
  return (
    <div>
      {selfUser ? (
        <MyPresentations />
      ) : (
        <div>
          <h1 className="mb-1 text-center text-3xl font-bold text-selfprimary-900 md:text-4xl">
            Hiányolod az előadásaidat?
          </h1>
          <LoginButton />
        </div>
      )}
      <a href="/jelentkezes">
        <Alert className="mt-4 text-left" color="primary">
          Az előadásjelentkezési felület megtekintéséhez kattints ide!
        </Alert>
      </a>
      <a href="https://docs.google.com/spreadsheets/d/1wZtmbTTELxQK0nQJweKbURFqNOboOwyyR9WGdB9Fc6E/edit?usp=sharing">
        <Alert className="mt-4 text-left" color="secondary">
          Az sporteredmények vagy a programok megtekintéséhez kattints ide!
        </Alert>
      </a>

      <div className="my-4 rounded-xl bg-selfprimary-100 bg-gradient-to-r p-4 text-foreground shadow-lg md:p-6">
        <h2 className="text-xl font-bold md:text-2xl">
          Kötélhúzás (12:30-13:30)
        </h2>
        <p className="mt-1 text-xs opacity-90 md:text-sm">
          Minden osztályt szeretettel várunk a nagytesiben megrendezésre kerülő
          kötélhúzó versenyre! Gyere el, és mutasd meg, hogy a te osztályod a
          legerősebb!
        </p>
      </div>

      {siteConfig.pageSections["menza"] != "hidden" && (
        <MenuInSection selfUser={selfUser} />
      )}
      <ProgramBlock />
      <p className="hidden text-center italic">„Bömbi a király”</p>
      <div className="hidden">
        {
          "Az oldal a Budapest V. Kerületi Eötvös József Gimnázium (más néven EJG) Diákönkormányzatának (más néven DÖ) tájékoztató oldala."
        }
      </div>
    </div>
  );
}
