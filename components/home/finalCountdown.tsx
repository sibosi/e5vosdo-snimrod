import React from "react";
import { Countdown } from "./countdown";
import { Vakacio } from "./vakacio";

const FinalCountdown = () => {
  return (
    <div className="mb-4 flex h-[150px] flex-col items-center justify-center gap-4">
      <Vakacio date="2025-06-20T09:00:00Z" />
      <Countdown date="2025-06-20T09:00:00Z" />
    </div>
  );
};

export default FinalCountdown;
