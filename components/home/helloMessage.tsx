import React from "react";
import TxtLiquid from "./txtLiquid";
import { UserType } from "@/db/dbreq";

const HelloMessage = ({ selfUser }: { selfUser: UserType | undefined }) => {
  return (
    <div className="pb-14 text-center text-foreground">
      {selfUser ? (
        <h1 className="inline text-5xl font-semibold lg:text-5xl">
          Helló <TxtLiquid text={selfUser.nickname} />!
        </h1>
      ) : (
        <div className="inline text-4xl font-semibold lg:text-5xl">
          Helló{" "}
          <p className="inline bg-gradient-to-l from-selfprimary-300 to-selfprimary-700 bg-clip-text text-transparent">
            Eötvös Népe
          </p>
          !
        </div>
      )}
    </div>
  );
};

export default HelloMessage;
