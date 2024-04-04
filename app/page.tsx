import { InfoCard } from "@/components/infocard";
import "@/styles/bgimage.css";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { button as buttonStyles } from "@nextui-org/theme";

import { groupsConfig } from "@/config/groups";

export default function Home() {
  return (
    <div>
      <div className="gap-2 grid grid-cols-2 sm:grid-cols-4 border-b-8 border-transparent justify-items-center">
        {groupsConfig.clubs.map((groups, index) => (
          <InfoCard
            key={index}
            title={groups.title}
            details={groups.details}
            image={groups.image}
          />
        ))}
      </div>

      <div className="hero bgimage">
        <div className="hero-overlay bg-opacity-60"></div>
        <div className="hero-content text-center text-neutral-content">
          <div className="max-w-md">
            <h1 className="mb-5 text-5xl font-bold">Helló Eötvös népe!</h1>
            <p className="mb-5">
              A DÖ kötelessége a diákok érdekeinek eleget tenni. Egy rövid
              űrlapon megoszthatjátok észrevételeiteket, javaslataitokat és
              esetleges problémáitokat.
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
