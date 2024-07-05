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

export default async function Home() {
  const selfUser = await getAuth();
  return (
    <div>
      <div className="text-center pb-14 text-foreground">
        {selfUser ? (
          <>
            <h1 className="inline text-5xl font-semibold lg:text-5xl">
              Helló{" "}
              <p className="inline from-[#39b2f8] to-[#2747fc] bg-clip-text text-transparent bg-gradient-to-l">
                {selfUser.nickname}
              </p>
              !
            </h1>
          </>
        ) : (
          <h1 className="inline text-4xl font-semibold lg:text-5xl">
            Valami&nbsp;
            <p className="inline from-[#FF1CF7] to-[#b249f8] bg-clip-text text-transparent bg-gradient-to-l">
              jó&nbsp;
            </p>
            készül...
          </h1>
        )}
      </div>

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
          <Menu />
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
        <Link href={"/clubs"} color="primary" className="block">
          Klubok és szakkörök ➜
        </Link>
        <Link href={"/events"} color="primary" className="block">
          Összes esemény ➜
        </Link>
      </Section>

      <div className="hero bg-[url('/opinion.png')]">
        <div className="hero-overlay bgcolor "></div>
        <div className="hero-content text-center text-neutral-content">
          <div className="max-w-md text-black rounded-lg p-4 backdrop-blur-sm bg-danger-foreground bg-opacity-70">
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
