"use client";
import { loadPalette } from "@/components/themePicker";
import { useEffect } from "react";

export function reloadColors(targetTheme?: "light" | "dark" | "system") {
  if (typeof window === "undefined") return;

  const storedTheme = targetTheme ?? localStorage.getItem("theme");
  const theme = storedTheme
    ? (storedTheme as "light" | "dark" | "system")
    : "system";

  if (theme === "dark") {
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else if (theme === "light") {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    localStorage.setItem("theme", "light");
  } else {
    localStorage.setItem("theme", "system");
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }

  ["primary", "secondary"].forEach((selfColor) => {
    loadPalette(selfColor, theme);
  });
}

const RunClientSide = () => {
  useEffect(() => {
    reloadColors();
  }, []);

  return <></>;
};

export default RunClientSide;
