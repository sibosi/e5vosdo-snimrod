"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type DigitProps = {
  value: string;
};

export const CountdownDigit = ({ value }: DigitProps) => {
  return (
    <div className="relative flex h-10 w-14 items-center justify-center overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.span
          key={value}
          className="absolute font-mono text-5xl leading-none"
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.3, ease: "circOut" }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export const Countdown = ({ date }: { date: string }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: "#",
    hours: "#",
    minutes: "#",
    seconds: "#",
  });

  useEffect(() => {
    const update = () => {
      setTimeLeft(calculateTimeLeft(date));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [date]);

  const calculateTimeLeft = (date: string) => {
    const difference = +new Date(date) - +new Date();
    let timeLeft: any;

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24))
          .toString()
          .padStart(2, "0"),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24)
          .toString()
          .padStart(2, "0"),
        minutes: Math.floor((difference / 1000 / 60) % 60)
          .toString()
          .padStart(2, "0"),
        seconds: Math.floor((difference / 1000) % 60)
          .toString()
          .padStart(2, "0"),
      };
    } else {
      timeLeft = {
        days: "00",
        hours: "00",
        minutes: "00",
        seconds: "00",
      };
    }
    return timeLeft;
  };

  return (
    <div className="grid auto-cols-max grid-flow-col gap-5 text-center text-foreground">
      <div className="flex flex-col items-center">
        <CountdownDigit value={timeLeft.days} />
        <span>nap</span>
      </div>
      <div className="flex flex-col items-center">
        <CountdownDigit value={timeLeft.hours} />
        <span>óra</span>
      </div>
      <div className="flex flex-col items-center">
        <CountdownDigit value={timeLeft.minutes} />
        <span>perc</span>
      </div>
      <div className="flex flex-col items-center">
        <CountdownDigit value={timeLeft.seconds} />
        <span>mp.</span>
      </div>
    </div>
  );
};
