import React from "react";
import { Countdown } from "../home/countdown";

const Access = ({ name }: { name: string | undefined }) => {
  return (
    <div className="pb-14 text-center text-foreground">
      <main>
        <br />
        <br />
        <br />

        {typeof name === "string" ? (
          <h1 className="inline text-4xl font-semibold lg:text-5xl">
            Helló{" "}
            <p className="inline bg-linear-to-l from-[#f89c39] to-[#a74500] bg-clip-text text-transparent">
              {name.split(" ")[0]}
            </p>
            !
          </h1>
        ) : (
          <h1 className="inline text-4xl font-semibold lg:text-5xl">
            Helló{" "}
            <p className="inline bg-linear-to-l from-[#f89c39] to-[#a74500] bg-clip-text text-transparent">
              Eötvös Népe
            </p>
            !
          </h1>
        )}
        <div className="py-6 text-base font-semibold">
          <p>Végre itt a nyár! Ilyenkor mi is pihenünk.</p>
          <p>Várunk vissza szeptemberben a legújabb funkciókkal!</p>
        </div>

        <div className="mx-auto max-w-fit">
          <Countdown date="2024/09/02 9:00" />
        </div>
      </main>
    </div>
  );
};

export default Access;
