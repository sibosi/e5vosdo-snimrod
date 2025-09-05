"use client";

import { ReactNode, useEffect, useState } from "react";

export default function ChangingComponent({
  startComponent,
  endComponent,
}: {
  startComponent: ReactNode;
  endComponent: ReactNode;
}) {
  const TIME = 3000;
  const FADE = 1;

  const [showStart, setShowStart] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowStart(false);
    }, TIME);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          transition: `opacity ${FADE}s`,
          opacity: showStart ? 1 : 0,
          position: showStart ? "relative" : "absolute",
        }}
      >
        {startComponent}
      </div>
      <div
        style={{
          transition: `opacity ${FADE}s`,
          opacity: showStart ? 0 : 1,
          position: showStart ? "absolute" : "relative",
        }}
      >
        {endComponent}
      </div>
    </div>
  );
}
