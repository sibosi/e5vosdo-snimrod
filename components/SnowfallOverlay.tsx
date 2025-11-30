"use client";

import Snowfall from "react-snowfall";

export default function SnowfallOverlay() {
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
        zIndex: 10,
      }}
    />
  );
}
