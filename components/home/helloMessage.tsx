import React from "react";
import TxtLiquid from "./txtLiquid";
import { PossibleUserType } from "@/db/dbreq";

const HelloMessage = ({
  selfUser,
  size = "md",
  padding = true,
}: {
  selfUser: PossibleUserType;
  size?: "md" | "sm";
  padding?: boolean;
}) => {
  if (selfUser)
    return (
      <div className={"text-center text-foreground " + (padding && "pb-14")}>
        <h1
          className={
            "w-min-max no-wrap inline-flex items-center font-semibold " +
            (size == "md" ? "text-5xl lg:text-5xl" : "text-3xl lg:text-3xl")
          }
        >
          Helló&nbsp;
          <TxtLiquid text={selfUser.nickname} />
          <span>!</span>
        </h1>
      </div>
    );

  if (!selfUser)
    return (
      <div className={"text-center text-foreground " + (padding && "pb-14")}>
        <div className="inline text-4xl font-semibold lg:text-5xl">
          <span>Helló&nbsp;</span>
          <span className="inline bg-linear-to-l from-selfprimary-300 to-selfprimary-700 bg-clip-text text-transparent">
            Eötvös Népe
          </span>
          <span>!</span>
        </div>
      </div>
    );

  if (selfUser === null)
    return (
      <div className={"text-center text-foreground " + (padding && "pb-14")}>
        <div className="inline text-4xl font-semibold lg:text-5xl">
          Valami hiba történt
        </div>
      </div>
    );
};

export default HelloMessage;
