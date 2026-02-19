"use client";
import React, { useEffect, useState, useCallback } from "react";
import "@/styles/globals.css";
import {
  Spicy_Rice,
  Pacifico,
  Playwrite_DE_Grund,
  Matemasie,
} from "next/font/google";
import localFont from "next/font/local";

const matemasie = Matemasie({ subsets: ["latin"], weight: "400" });
const spicyRice = Spicy_Rice({ subsets: ["latin"], weight: "400" });
const pacifico = Pacifico({ subsets: ["latin"], weight: "400" });
const playwrite = Playwrite_DE_Grund({ weight: "400" });
const ndot57 = localFont({ src: "../../public/fonts/Ndot57-Regular.otf" });

interface TextFont {
  font?: string;
}

const textsAndFonts: TextFont[] = [
  { font: undefined },
  { font: matemasie.style.fontFamily },
  { font: spicyRice.style.fontFamily },
  { font: pacifico.style.fontFamily },
  { font: playwrite.style.fontFamily },
  { font: ndot57.style.fontFamily },
];

interface TxtLiquidProps {
  text: string;
}

const TxtLiquid: React.FC<TxtLiquidProps> = ({ text }) => {
  const [clicked, setClicked] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  const [currentTextAndFont, setCurrentTextAndFont] = useState<TextFont>(
    textsAndFonts[0],
  );
  const [fade, setFade] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("helloFont");
      if (saved) {
        setCurrentTextAndFont(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error reading from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (!clicked) return;

    setFade(true);

    const updateTimeout = setTimeout(() => {
      const newFont = textsAndFonts[renderKey % textsAndFonts.length];
      setCurrentTextAndFont(newFont);
      try {
        localStorage.setItem("helloFont", JSON.stringify(newFont));
      } catch (error) {
        console.error("Error saving to localStorage", error);
      }
      setFade(false);
    }, 200); // Sync with CSS transition duration

    const resetClickedTimeout = setTimeout(() => {
      setClicked(false);
    }, 1000); // Enough time for the animation to finish

    return () => {
      clearTimeout(updateTimeout);
      clearTimeout(resetClickedTimeout);
    };
  }, [clicked, renderKey]);

  const handleTextClick = useCallback(() => {
    if (clicked) return;
    setRenderKey((prev) => prev + 1);
    setClicked(true);
  }, [clicked]);

  return (
    <div
      onClick={handleTextClick}
      className={`bg-linear-to-l relative inline from-selfprimary-300 to-selfprimary-700 bg-clip-text text-transparent transition-opacity duration-200 ${
        fade ? "opacity-0" : "opacity-100"
      }`}
      style={{ fontFamily: currentTextAndFont.font }}
    >
      {text}
      <div
        className={`absolute left-0 top-0 min-h-full min-w-full bg-selfprimary-bg transition-all duration-200 ${
          clicked ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};

export default TxtLiquid;
