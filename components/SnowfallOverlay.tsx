"use client";

import { useEffect, useState } from "react";
import Snowfall from "react-snowfall";

export default function SnowfallOverlay() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("hideSnowfall") === "true") setIsVisible(false);
    else setIsVisible(true);
  }, []);

  if (!isVisible) return null;

  return (
    <Snowfall
      color="#fff"
      snowflakeCount={200}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 20,
      }}
    />
  );
}
