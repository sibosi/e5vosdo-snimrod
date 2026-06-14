"use client";

import { useEffect, useState } from "react";
import { Countdown } from "./countdown";
import { WaveText } from "./waveText";
import { getVacationText } from "./vakacio";

const FinalCountdown = ({ date }: { date: string }) => {
  const [text, setText] = useState("");

  useEffect(() => {
    setText(getVacationText(date));

    let timeoutId: NodeJS.Timeout;

    const scheduleUpdate = () => {
      const now = new Date();
      const tomorrow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      );
      const msUntilTomorrow = tomorrow.getTime() - now.getTime();

      timeoutId = setTimeout(() => {
        setText(getVacationText(date));
        scheduleUpdate();
      }, msUntilTomorrow + 100);
    };

    scheduleUpdate();

    return () => clearTimeout(timeoutId);
  }, [date]);

  if (!text) return null;

  return (
    <div className="mb-4 flex flex-col items-center justify-center gap-4">
      <WaveText text={text} />
      <Countdown date={date} />
    </div>
  );
};

export default FinalCountdown;
