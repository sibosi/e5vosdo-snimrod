import { siteConfig } from "@/config/site";
import React from "react";
import E5vosST from "@/public/groups/e5vosst.svg";
import E5Media from "@/public/groups/media.jpg";
import Image from "next/image";

type ElementType = {
  title: string;
  url: string;
  icon: React.ReactNode;
  sizeX?: number;
  sizeY?: number;
};

const iconSize = 30;
const SVGAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 30,
  height: 30,
  fill: "currentColor",
  viewBox: "0 0 16 16",
};

const Footer = () => {
  const STYLES =
    "flex gap-0.5 p-2 flex-col items-center justify-center rounded-lg bg-selfprimary-bg text-center text-sm text-foreground hover:text-selfprimary-900";

  return (
    <div className="mb-2 max-h-fit rounded-2xl bg-selfprimary-100 p-2">
      <div className="grid grid-flow-col grid-cols-4 grid-rows-5 justify-center gap-2">
        <a
          href={siteConfig.links.mediaGallery}
          className={STYLES + " col-span-4 row-span-1 flex"}
        >
          <div className="flex items-center justify-center gap-2">
            <Image
              src={E5Media}
              alt="Eötvös Média"
              width={iconSize * 2}
              height={iconSize * 2}
              className="rounded-xl"
            />
            <p>Csekkold az Eötvös Média fotógalériáját!</p>
          </div>
        </a>

        <a href="/me" className={STYLES}>
          <svg {...SVGAttributes}>
            <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
            <path
              fillRule="evenodd"
              d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"
            />
          </svg>
          profilom
        </a>
        <a href={siteConfig.links.gdrive} className={STYLES}>
          <svg {...SVGAttributes}>
            <path d="M12 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2M5 4h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1m-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5M5 8h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1m0 2h3a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1" />
          </svg>
          doksik
        </a>

        <a
          href={siteConfig.links.feedback}
          className={STYLES + " col-span-4 row-span-1 flex"}
        >
          <div className="flex items-center justify-center gap-2">
            <svg {...SVGAttributes} className="mx-2 min-w-fit">
              <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.5a1 1 0 0 0-.8.4l-1.9 2.533a1 1 0 0 1-1.6 0L5.3 12.4a1 1 0 0 0-.8-.4H2a2 2 0 0 1-2-2zm3.5 1a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1z" />
            </svg>
            <p>
              Küldj visszajelzést a DÖ-nek vagy a fejlesztőnek! (hibák, ötletek,
              stb.)
            </p>
            <h5 className="mt-1 rounded-xl bg-selfsecondary-200 px-3 py-1">
              Irány az űrlap!
            </h5>
          </div>
        </a>

        <a href="/welcome" className={STYLES + " col-span-4 row-span-1 flex"}>
          <div className="flex items-center justify-center gap-2">
            <p>➜&nbsp; Megnézem újra a bemutatkozó oldalt! &nbsp;➜</p>
          </div>
        </a>

        <a href="/clubs" className={STYLES}>
          <svg {...SVGAttributes}>
            <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
          </svg>
          klubok
        </a>

        <a href="/events" className={STYLES}>
          <svg {...SVGAttributes}>
            <path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4zM16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2M9.5 7h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5m3 0h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5M2 10.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5" />
          </svg>
          események
        </a>

        <a
          href="/est"
          className={
            STYLES + " text-red col-span-2 row-span-2 text-selfprimary-500"
          }
        >
          <E5vosST width="fit" className="max-h-40" />
        </a>
      </div>
    </div>
  );
};

export default Footer;
