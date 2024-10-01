"use client";
import React, { useEffect, useState } from "react";
import "@/styles/globals.css";

const textsAndFonts = [
  {
    font: undefined,
  },
  {
    font: "Matemasie, sans-serif",
    fontURLpart: "family=Matemasie",
  },
  {
    font: "Spicy Rice, serif",
    fontURLpart: "family=Spicy+Rice",
  },
  {
    font: "Pacifico, cursive",
    fontURLpart: "family=Pacifico",
  },
  {
    font: "Playwrite DE Grund, cursive",
    fontURLpart: "family=Playwrite+DE+Grund:wght@100..400",
  },
];

let URL = "https://fonts.googleapis.com/css2?";

textsAndFonts.forEach((element) => {
  URL += element.fontURLpart + "&";
});

URL += "display=swap";

const TxtLiquid = ({ text }: { text: string }) => {
  const [clicked, setClicked] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  const [currentTextAndFont, setCurrentTextAndFont] = useState(
    textsAndFonts[renderKey % textsAndFonts.length],
  );
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const savedFont = localStorage.getItem("helloFont");
    if (savedFont) setCurrentTextAndFont(JSON.parse(savedFont));
  }, []);

  useEffect(() => {
    if (!clicked) return;

    setFade(true);
    const timeoutId = setTimeout(() => {
      setCurrentTextAndFont(textsAndFonts[renderKey % textsAndFonts.length]);
      localStorage.setItem(
        "helloFont",
        JSON.stringify(textsAndFonts[renderKey % textsAndFonts.length]),
      );

      setFade(false);
    }, 200); // Duration should match the CSS transition duration

    const animationTimeout = setTimeout(() => {
      setClicked(false);
    }, 1000); // Enough time for the animation to finish

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(animationTimeout);
    };
  }, [clicked, renderKey]);

  const handleTextClick = () => {
    if (clicked) return;
    setRenderKey((prev) => prev + 1);
    setClicked(true);
  };

  return (
    <div
      onClick={handleTextClick}
      className={
        "relative inline bg-gradient-to-l from-selfprimary-300 to-selfprimary-700 bg-clip-text text-transparent " +
        (!fade ? "text-opacity-0" : "text-opacity-100")
      }
      style={{
        fontFamily: currentTextAndFont.font,
      }}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link href={URL} rel="stylesheet" />

      {text}

      <div
        className={
          "absolute left-0 top-0 min-h-full min-w-full bg-selfprimary-bg transition-all duration-200 " +
          (clicked ? "opacity-100" : "opacity-0")
        }
      />
    </div>
  );
};

export default TxtLiquid;
