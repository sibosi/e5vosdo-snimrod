"use client";

import { useEffect, useState } from "react";
import Snowfall from "react-snowfall";

export default function SnowfallOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  // const [images, setImages] = useState<HTMLImageElement[]>([]);

  useEffect(() => {
    if (localStorage.getItem("hideSnowfall") === "true") setIsVisible(false);
    else setIsVisible(true);

    // const snowflake = document.createElement("img");
    // snowflake.src = "/heart.png";

    // snowflake.onload = () => {setImages([snowflake])};

    // snowflake.onerror = () => {console.error("Failed to load heart image")};
  }, []);

  if (!isVisible) return null;

  return (
    <Snowfall
      color="#fff"
      snowflakeCount={200}
      // radius={[5, 13]}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 20,
      }}
      // images={images}
    />
  );
}
