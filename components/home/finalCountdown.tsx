import React from "react";
import { Countdown } from "./countdown";
import { WaveText } from "./waveText";
import { getAuth } from "@/db/dbreq";
import { gate } from "@/db/permissions";
import { getVacationText, Vakacio } from "./vakacio";

const FinalCountdown = async ({ date }: { date: string }) => {
  const selfUser = await getAuth();
  return (
    <div className="mb-4 flex flex-col items-center justify-center gap-4">
      {gate(selfUser, "tester", "boolean") ? (
        <WaveText text={getVacationText(date)} />
      ) : (
        <Vakacio date={date} />
      )}
      <Countdown date={date} />
    </div>
  );
};

export default FinalCountdown;
