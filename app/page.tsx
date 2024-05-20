import "@/styles/bgimage.css";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { button as buttonStyles } from "@nextui-org/theme";

import { groupsConfig } from "@/config/groups";
import clsx from "clsx";
import { PopupCard } from "@/components/popupcard";
import { title } from "@/components/primitives";
import { QuickTeachers } from "@/components/helyettesites/quickteacher";
import { Menu } from "@/components/menza/menu";
import { Countdown } from "@/components/countdown";

export default function Home() {
  const calculateTimeLeft = () => {
    let year = new Date().getFullYear();
    const difference = +new Date(`${year}-10-1`) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
  };

  return (
    <div>
      <div className="text-center justify-center py-14 text-foreground">
        <h1 className={title()}>Valami&nbsp;</h1>
        <h1 className={title({ color: "violet" })}>jó&nbsp;</h1>
        <h1 className={title()}>készül...</h1>
      </div>

      <>
        <h1 className="flex justify-center text-foreground text-3xl font-semibold py-1">
          Tanévzárás
        </h1>

        <div className="flex justify-center items-center text-foreground">
          <Countdown date="2024-6-21 9:00" />
        </div>
      </>

      <QuickTeachers />

      <Menu />

      <div className="text-left gap-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-b-8 border-transparent justify-items-center py-5">
        {groupsConfig.clubs.map((groups, index) => (
          <PopupCard
            key={index}
            title={groups.title}
            details={groups.details}
            description={groups.description}
            image={groups.image}
            popup={true}
          />
        ))}
      </div>

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
