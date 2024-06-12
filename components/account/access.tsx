import { siteConfig } from "@/config/site";
import { Button } from "@nextui-org/react";
import Link from "next/link";
import React from "react";

const Access = ({ name }: { name: string | undefined }) => {
  return (
    <div className="text-center pb-14 text-foreground">
      <main>
        <br />
        <br />
        <br />
        {typeof name === "string" ? (
          <>
            {console.log(name)}
            <h1 className="inline text-4xl font-semibold lg:text-5xl">
              Helló{" "}
              <p className="inline from-[#397cf8] to-[#0026ff] bg-clip-text text-transparent bg-gradient-to-l">
                {name.split(" ")[0]}
              </p>
              !
            </h1>
            <br />
            <p>Sajnáljuk, jelenleg nincs hozzáférésed az oldalhoz.</p>
            <br />
            <Button color="primary">
              <Link href={siteConfig.links.feedback}>Hozzáférés kérése</Link>
            </Button>
          </>
        ) : (
          <>
            <h1 className="inline text-4xl font-semibold lg:text-5xl pt-24">
              Valami&nbsp;
              <p className="inline from-[#FF1CF7] to-[#b249f8] bg-clip-text text-transparent bg-gradient-to-l">
                jó&nbsp;
              </p>
              készül...
            </h1>
            <br />
            <h2 className="inline text-xl font-semibold lg:text-5xl pt-24">
              De most egy kis szünetet tartunk...
            </h2>
            <br />
            <br />
            <h2 className="inline text-xl lg:text-5xl py-24">
              Korlátozott hozzáférés
            </h2>
            <br />
            <Button color="primary">
              <Link href={siteConfig.links.feedback}>Hozzáférés kérése</Link>
            </Button>
            <br />
            <br />
            <p>Van hozzáférésed? Jelentkezz be a folytatáshoz!</p>
          </>
        )}
      </main>
    </div>
  );
};

export default Access;
