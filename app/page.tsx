import "@/styles/bgimage.css";
import { siteConfig } from "@/config/site";
import { Link } from "@nextui-org/link";
import { button as buttonStyles } from "@nextui-org/theme";

import clsx from "clsx";
import { QuickTeachers } from "@/components/helyettesites/quickteacher";
import { Menu } from "@/components/menza/menu";
import { Section } from "@/components/home/section";
import { Events } from "@/components/events";
import { RoomChanges } from "@/components/roomchanges/roomchanges";
import { getAuth } from "@/db/dbreq";
import TimetableDay from "@/components/timetable/timetableday";
import ThemePicker from "@/components/themePicker";

export default async function Home() {
  const selfUser = await getAuth();
  return (
    <div>
      <div className="pb-14 text-center text-foreground">
        {selfUser ? (
          <>
            <h1 className="inline text-5xl font-semibold lg:text-5xl">
              Helló{" "}
              <p className="inline bg-gradient-to-l from-selfprimary-300 to-selfprimary-700 bg-clip-text text-transparent">
                {selfUser.nickname}
              </p>
              !
            </h1>
          </>
        ) : (
          <h1 className="inline text-4xl font-semibold lg:text-5xl">
            Valami&nbsp;
            <p className="inline bg-gradient-to-l from-[#FF1CF7] to-[#b249f8] bg-clip-text text-transparent">
              jó&nbsp;
            </p>
            készül...
          </h1>
        )}
      </div>

      <ThemePicker />

      {selfUser ? <TimetableDay selfUser={selfUser} /> : <></>}

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

      <Section title="Keresel valamit?" className="max-w-xs">
        <Link href={"/clubs"} className="block text-selfprimary">
          Klubok és szakkörök ➜
        </Link>
        <Link href={"/events"} className="block text-selfprimary">
          Összes esemény ➜
        </Link>
      </Section>

      <div className="hero bg-[url('/opinion.png')]">
        <div className="bgcolor hero-overlay"></div>
        <div className="hero-content text-center text-neutral-content">
          <div className="max-w-md rounded-lg bg-danger-foreground bg-opacity-70 p-4 text-black backdrop-blur-sm">
            <h1 className={clsx("mb-5 text-4xl font-bold")}>
              Helló Eötvös népe!
              <br />
            </h1>
            <p className={clsx("mb-5 w-auto text-lg lg:text-lg")}>
              A DÖ kötelessége a diákok érdekeinek eleget tenni. Az űrlapon
              megoszthatjátok észrevételeiteket, javaslataitokat és esetleges
              problémáitokat.
              <br />
            </p>
            <Link
              href={siteConfig.links.feedback}
              className={buttonStyles({
                color: "primary",
                radius: "full",
                variant: "solid",
              })}
            >
              Irány az űrlap!
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden">
        {
          "Az oldal a Budapest V. Kerületi Eötvös József Gimnázium (más néven EJG) Diákönkormányzatának (más néven DÖ) tájékoztató oldala."
        }
      </div>
    </div>
  );
}
