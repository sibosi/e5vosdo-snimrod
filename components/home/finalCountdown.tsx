import React from "react";
import { Countdown } from "./countdown";
import { Vakacio } from "./vakacio";

const FinalCountdown = () => {
  return (
    <div className="flex h-[150px] flex-col items-center justify-center gap-2">
      <Vakacio date="2025-06-20T13:15:00Z" />
      <Countdown date="2025-06-20T13:15:00Z" />
    </div>
  );
};

export default FinalCountdown;
