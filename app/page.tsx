import "@/styles/bgimage.css";
import { siteConfig } from "@/config/site";
import { Link } from "@nextui-org/link";
import { button as buttonStyles } from "@nextui-org/theme";

import clsx from "clsx";
import { PopupCard } from "@/components/popupcard";
import { title } from "@/components/primitives";
import { QuickTeachers } from "@/components/helyettesites/quickteacher";
import { Menu } from "@/components/menza/menu";
import { Countdown } from "@/components/countdown";
import { eventsConfig } from "@/config/events";
import { Chip } from "@nextui-org/react";
import { Section } from "@/components/section";
import Scoreboard from "@/components/sportresults";

const { execSync } = require("child_process");

const command = "python3 components/helyettesites/getTable.py";
const output = execSync(command, { encoding: "utf-8" }); // Capture output

console.log(output); // Print the output of the command

export default function Home() {
  return (
    <div>
      <div className="text-center justify-center py-14 text-foreground">
        <h1 className={title()}>Valami&nbsp;</h1>
        <h1 className={title({ color: "violet" })}>jó&nbsp;</h1>
        <h1 className={title()}>készül...</h1>
      </div>

      <Scoreboard
        player1Name="Player 1"
        player2Name="Player 2"
        player1Score={10}
        player2Score={15}
        player1Color="blue"
        player2Color="red"
      />

      <>
        <h1 className="flex justify-center text-foreground text-3xl font-semibold py-1">
          Tanévzárás
        </h1>

        <div className="flex justify-center items-center text-foreground">
          <Countdown date="2024-6-21 9:00" />
        </div>
      </>

      <Section title={"Helyettesítések"}>
        <QuickTeachers />
      </Section>

      <Section title="Mi a mai menü?">
        <Menu />
      </Section>

      <Section title="Események">
        <div className="text-left gap-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-b-8 border-transparent justify-items-center pb-5">
          {eventsConfig.events.map(
            (event, index) =>
              new Date(event._hide_time_) > new Date() && (
                <PopupCard
                  key={index}
                  title={event.title}
                  details={event.details}
                  description={event.time}
                  image={event.image}
                  popup={true}
                >
                  <div className="flex gap-2">
                    {event.tags.map((tag, index) => (
                      <Chip key={tag + "" + index} color="warning" size="sm">
                        {tag}
                      </Chip>
                    ))}
                  </div>
                </PopupCard>
              )
          )}
        </div>
      </Section>

      <Section title="Keresel valamit?">
        <Link href={"/clubs"} color="primary" className="block">
          Klubok és szakkörök ➜
        </Link>
        <Link href={"/clubs"} color="primary" className="block">
          Összes esemény ➜
        </Link>
      </Section>

      <div className="hero bgimage">
        <div className="hero-overlay bgcolor"></div>
        <div className="hero-content text-center text-neutral-content">
          <div className="max-w-md text-black rounded-lg p-4 backdrop-blur-sm bg-danger-foreground bg-opacity-70">
            <h1 className={clsx("mb-5 text-4xl font-bold")}>
              Helló Eötvös népe!
              <br />
            </h1>
            <p className={clsx("mb-5 w-auto text-lg lg:text-lg")}>
              A DÖ kötelessége a diákok érdekeinek eleget tenni. Egy rövid
              űrlapon megoszthatjátok észrevételeiteket, javaslataitokat és
              esetleges problémáitokat.
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
    </div>
  );
}
