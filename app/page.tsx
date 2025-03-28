import "@/styles/bgimage.css";
import { siteConfig } from "@/config/site";
import {
  QuickTeachers,
  QuickTeachersDev,
} from "@/components/helyettesites/quickteacher";
import { Menu } from "@/components/menza/menu";
import { Section } from "@/components/home/section";
import { Events } from "@/components/events";
import { RoomChanges } from "@/components/roomchanges/roomchanges";
import { getAuth } from "@/db/dbreq";
import TimetableDay from "@/components/timetable/timetableday";
import HelloMessage from "@/components/home/helloMessage";
import Carousel from "@/components/home/carousel";
import Tray from "@/components/tray";
import LoginButton from "@/components/LoginButton";
import Footer from "@/components/footer";
import TeamsAD from "./admin/matches/ad";

export default async function Home() {
  const selfUser = await getAuth();
  return (
    <div>
      {!selfUser?.permissions.includes("user") && (
        <></> // <HelloMessage selfUser={selfUser} />
      )}

      <TeamsAD />

      {(() => {
        if (selfUser?.permissions.includes("user")) {
          return; // <Carousel selfUser={selfUser} data={[]} />;
        } else if (selfUser === null) {
          return (
            <Tray>
              <h1 className="text-3xl font-bold text-selfprimary-900 md:text-4xl">
                Sajnáljuk, valamilyen hiba történt. Kérjük, próbáld újra később!
              </h1>
            </Tray>
          );
        } else {
          return (
            <Tray>
              <h1 className="text-3xl font-bold text-selfprimary-900 md:text-4xl">
                Hiányolsz valamit? Netán a híreket?
                <LoginButton />
              </h1>
            </Tray>
          );
        }
      })()}

      {siteConfig.pageSections["teremcserek"] != "hidden" && (
        <Section
          title={"Teremcserék"}
          dropdownable={true}
          defaultStatus={siteConfig.pageSections["teremcserek"]}
        >
          <RoomChanges />
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
        <Section
          title="Mi a mai menü?"
          dropdownable={true}
          defaultStatus={siteConfig.pageSections["menza"]}
        >
          <Menu
            menu={
              selfUser?.food_menu == "A" || selfUser?.food_menu == "B"
                ? selfUser?.food_menu
                : undefined
            }
          />
        </Section>
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

      {selfUser ? (
        <Section title={"Órarend"} dropdownable={true} defaultStatus={"opened"}>
          <TimetableDay selfUser={selfUser} hideTitle />
        </Section>
      ) : null}

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
