"use client";

import { useEffect, useState } from "react";

export default function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <p className="mt-4 text-center text-2xl">
      {time.toLocaleTimeString("hu-HU", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}
    </p>
  );
}
