import React from "react";
import TxtLiquid from "./txtLiquid";
import { PossibleUserType } from "@/db/dbreq";

const HelloMessage = ({
  selfUser,
  size,
  textClass,
  padding = true,
}: {
  selfUser: PossibleUserType;
  size?: "md" | "sm";
  textClass?: string;
  padding?: boolean;
}) => {
  if (!textClass) {
    if (size === "sm") textClass = "text-3xl lg:text-3xl";
    else textClass = "text-5xl lg:text-5xl";
  }

  if (selfUser)
    return (
      <div
        className={"text-center text-foreground " + (padding ? "pb-14" : "")}
      >
        <h1
          className={
            "w-min-max no-wrap inline-flex items-center font-semibold " +
            textClass
          }
        >
          Helló&nbsp;
          <TxtLiquid text={selfUser.nickname} />
          <span>!</span>
        </h1>
      </div>
    );

  if (size === undefined && textClass === undefined)
    textClass = "text-4xl lg:text-5xl";

  if (!selfUser)
    return (
      <div
        className={"text-center text-foreground " + (padding ? "pb-14" : "")}
      >
        <div className={"inline font-semibold " + textClass}>
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
