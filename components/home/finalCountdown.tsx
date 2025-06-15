import React from "react";
import { Countdown } from "./countdown";
import { WaveText } from "./waveText";
import { getVacationText } from "./vakacio";

const FinalCountdown = ({ date }: { date: string }) => {
  return (
    <div className="mb-4 flex flex-col items-center justify-center gap-4">
      <WaveText text={getVacationText(date)} />
      <Countdown date={date} />
    </div>
  );
};

export default FinalCountdown;
