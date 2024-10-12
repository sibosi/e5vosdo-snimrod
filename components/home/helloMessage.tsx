import React from "react";
import TxtLiquid from "./txtLiquid";
import { UserType } from "@/db/dbreq";

const HelloMessage = ({
  selfUser,
  size = "md",
  padding = true,
}: {
  selfUser: UserType | undefined;
  size?: "md" | "sm";
  padding?: boolean;
}) => {
  return (
    <div className={"text-center text-foreground " + (padding && "pb-14")}>
      {selfUser ? (
        <h1
          className={
            "inline font-semibold " +
            (size == "md" ? "text-5xl lg:text-5xl" : "text-3xl lg:text-3xl")
          }
        >
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
