import { siteConfig } from "@/config/site";
import { Button } from "@nextui-org/react";
import Link from "next/link";
import React from "react";
import Login from "../LoginForm";
import { Countdown } from "../countdown";

const Access = ({ name }: { name: string | undefined }) => {
  return (
    <div className="text-center pb-14 text-foreground">
      <main>
        <br />
        <br />
        <br />
        {typeof name === "string" ?? console.log("No permission: " + name)}
        <>
          {typeof name === "string" ? (
            <h1 className="inline text-4xl font-semibold lg:text-5xl">
              Helló{" "}
              <p className="inline from-[#f89c39] to-[#a74500] bg-clip-text text-transparent bg-gradient-to-l">
                {name.split(" ")[0]}
              </p>
              !
            </h1>
          ) : (
            <h1 className="inline text-4xl font-semibold lg:text-5xl">
              Helló{" "}
              <p className="inline from-[#f89c39] to-[#a74500] bg-clip-text text-transparent bg-gradient-to-l">
                Eötvös Népe
              </p>
              !
            </h1>
          )}
          <div className="text-base font-semibold py-6">
            <p>Végre itt a nyár! Ilyenkor mi is pihenünk.</p>
            <p>Várunk vissza szeptemberben a legújabb funkciókkal!</p>
          </div>

          <div className="max-w-fit mx-auto">
            <Countdown date="2024/09/02 9:00" />
          </div>
        </>
      </main>
    </div>
  );
};

export default Access;
