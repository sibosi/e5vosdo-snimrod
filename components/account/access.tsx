import { siteConfig } from "@/config/site";
import { Button } from "@nextui-org/react";
import Link from "next/link";
import React from "react";
import Login from "../LoginForm";

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
              <p className="inline from-[#f89c39] to-[#a74500] bg-clip-text text-transparent bg-gradient-to-l">
                {name.split(" ")[0]}
              </p>
              !
            </h1>
            <div className="text-base font-semibold py-6">
              <p>Sajnáljuk, jelenleg nincs hozzáférésed az oldalhoz.</p>
              <p>
                Hozzáférés igénylése esetén, add meg a nevedet is az űrlapon!
              </p>
            </div>

            <Button color="primary">
              <Link href={siteConfig.links.feedback}>Hozzáférés kérése</Link>
            </Button>
          </>
        ) : (
          <>
            <h1 className="inline text-4xl font-semibold lg:text-5xl">
              Valami&nbsp;
              <p className="inline from-[#FF1CF7] to-[#b249f8] bg-clip-text text-transparent bg-gradient-to-l">
                jó&nbsp;
              </p>
              készül...
            </h1>
            <h2 className="text-xl font-semibold">
              Egyenlőre tesztelés alatt...
            </h2>
            <div className="text-base font-semibold pt-6">
              <p>Korlátozott hozzáférés</p>
              <p>Jelentkezz be a folytatáshoz az E5 fiókoddal!</p>
              <Login />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Access;
