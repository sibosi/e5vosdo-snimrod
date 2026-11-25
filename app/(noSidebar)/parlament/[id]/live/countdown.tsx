"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";

export default function Countdown({
  startTime,
}: Readonly<{ startTime: number }>) {
  const router = useRouter();
  const [now, setNow] = useState<number | null>(null);
  const [delayMs, setDelayMs] = useState(0);
  const remainingMs = startTime + delayMs - (now ?? startTime);

  useEffect(() => {
    setNow(Date.now());
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const refreshId = window.setInterval(() => router.refresh(), 5_000);
    return () => window.clearInterval(refreshId);
  }, [router]);

  const totalSeconds = Math.ceil(Math.max(0, remainingMs) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const addAMinute = () => {
    if (remainingMs <= 0) {
      setDelayMs((now ?? startTime) - startTime);
    }
    setDelayMs((current) => current + 60_000);
  };

  return (
    <div className="w-full rounded-xl bg-foreground/10 p-4">
      {now === null && (
        <p
          className="my-2 font-mono text-5xl font-bold tabular-nums"
          aria-live="polite"
        >
          --:--:--
        </p>
      )}
      {now !== null && remainingMs <= 0 && (
        <p className="text-3xl font-bold">Rögtön kezdünk!</p>
      )}
      {now !== null && remainingMs > 0 && (
        <>
          <p className="text-sm font-semibold uppercase tracking-wide">
            Kezdésig hátralévő idő
          </p>
          <p
            className="my-2 font-mono text-5xl font-bold tabular-nums"
            aria-live="polite"
          >
            {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </p>
        </>
      )}
      <Button variant="flat" className="mt-1" onPress={addAMinute}>
        Csúszás: +1 perc
      </Button>
    </div>
  );
}
