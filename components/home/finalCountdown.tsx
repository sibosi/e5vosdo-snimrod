import React from "react";
import { Countdown } from "./countdown";
import { Vakacio } from "./vakacio";

const FinalCountdown = ({ date }: { date: string }) => {
  return (
    <div className="mb-4 flex h-[150px] flex-col items-center justify-center gap-4">
      <Vakacio date={date} />
      <Countdown date={date} />
    </div>
  );
};

export default FinalCountdown;
