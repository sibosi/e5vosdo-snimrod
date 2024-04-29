import { InfoCard } from "@/components/infocard";
import "@/styles/bgimage.css";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { button as buttonStyles } from "@nextui-org/theme";

import { groupsConfig } from "@/config/groups";
import clsx from "clsx";
import { cookies } from "next/headers";
import { PopupCard } from "@/components/popupcard";

export default function Home() {
  const cookieStore = cookies();
  const theme = cookieStore.get("theme");
  return (
    <div>
      <div className="gap-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-b-8 border-transparent justify-items-center">
        {groupsConfig.clubs.map((groups, index) => (
          <PopupCard
            key={index}
            title={groups.title}
            details={groups.details}
            image={groups.image}
          />
        ))}
      </div>
      <div className="hero bgimage">
        <div className="hero-overlay bgcolor"></div>
        <div className="hero-content text-center text-neutral-content">
          <div className="max-w-md text-black rounded-lg p-4 backdrop-blur-sm bg-danger-foreground bg-opacity-70">
            <h1
              className={clsx(
                "mb-5 text-4xl font-bold"
                //title({ color: "blue" })
              )}
            >
              Helló Eötvös népe!
              <br />
            </h1>
            <p
              className={clsx(
                "mb-5 w-auto text-lg lg:text-lg"
                //title({ color: "blue" })
              )}
            >
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
