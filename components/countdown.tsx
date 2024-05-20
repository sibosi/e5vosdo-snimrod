"use client";
import { useEffect, useState } from "react";

export const Countdown = ({ date }: { date: string }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: "#",
    hours: "#",
    minutes: "#",
    seconds: "#",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft(date));
    }, 1000);

    return () => clearTimeout(timer); // Cleanup timer
  }, [timeLeft, date]);

  const calculateTimeLeft = (date: string) => {
    let year = new Date().getFullYear();
    const difference = +new Date(date) - +new Date();
    let timeLeft: any;

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
      timeLeft = {
        days: "#",
        hours: "#",
        minutes: "#",
        seconds: "#",
      };
    }
    return timeLeft;
  };

  return (
    <div className="grid grid-flow-col gap-5 text-center auto-cols-max text-foreground">
      <div className="flex flex-col items-center">
        <span className="countdown font-mono text-5xl">{timeLeft.days}</span>
        nap
      </div>
      <div className="flex flex-col">
        <span className="countdown font-mono text-5xl">{timeLeft.hours}</span>
        óra
      </div>
      <div className="flex flex-col">
        <span className="countdown font-mono text-5xl">{timeLeft.minutes}</span>
        perc
      </div>
      <div className="flex flex-col">
        <span className="countdown font-mono text-5xl">{timeLeft.seconds}</span>
        mp.
      </div>
    </div>
  );
};
