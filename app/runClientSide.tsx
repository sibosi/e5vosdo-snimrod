"use client";
import { loadPalette } from "@/components/themePicker";
import React from "react";

const RunClientSide = () => {
  const [theme, setTheme] = React.useState("system");

  React.useEffect(() => {
    setTheme(localStorage.getItem("theme") || "system");
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
      loadPalette(
        selfColor,
        ["dark", "light"].includes(theme)
          ? (theme as "dark" | "light")
          : window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light",
      );
    });
  }, [theme]);

  return <></>;
};

export default RunClientSide;
