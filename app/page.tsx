import "@/styles/bgimage.css";
import { siteConfig } from "@/config/site";
import { Link } from "@nextui-org/link";
import { button as buttonStyles } from "@nextui-org/theme";

import clsx from "clsx";
import { QuickTeachers } from "@/components/helyettesites/quickteacher";
import { Menu } from "@/components/menza/menu";
import { Countdown } from "@/components/countdown";
import { Section } from "@/components/section";
import { Events } from "@/components/events";
import { PageWarning } from "@/components/pagewarning";
import { Alert } from "@/components/alert";
import { RoomChanges } from "@/components/roomchanges";

export default function Home() {
  return (
    <div>
      <div className="text-center pb-14 text-foreground">
        <PageWarning />
        <h1 className="inline text-4xl font-semibold lg:text-5xl">
          Valami&nbsp;
          <p className="inline from-[#FF1CF7] to-[#b249f8] bg-clip-text text-transparent bg-gradient-to-l">
            jó&nbsp;
          </p>
          készül...
        </h1>
      </div>

      <div className="pb-3">
        <h1 className="flex justify-center text-foreground text-3xl font-semibold py-1">
          Tanévzárás
        </h1>

        <div className="flex justify-center items-center text-foreground">
          <Countdown date="2024/6/21 9:00" />
        </div>
      </div>

      <Alert className="bg-blue-300 border-blue-400">
        <Link
          className="text-sm font-bold"
          href="https://docs.google.com/forms/d/1WUhZoIFFll-IHyVV2GtYMvgMsBlDh0RC_lqChSSEMmg/edit#settings"
        >
          {"Jelentkezz"}
        </Link>
        {
          " még a héten 4+1 fős csapatoddal a június 14-i EJG x Apáczai röplabda bajnoksága! "
        }
      </Alert>

      <Section title={"Teremcserék"} dropdownable={true}>
        <RoomChanges />
      </Section>

      <Section title={"Helyettesítések"} dropdownable={true}>
        <QuickTeachers />
      </Section>

      <Section title="Mi a mai menü?" dropdownable={true}>
        <Menu />
      </Section>

      <Section title="Események" dropdownable={true}>
        <Events />
      </Section>

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
