"use client";

import { FC } from "react";
import { SwitchProps } from "@nextui-org/switch";
import { useEffect, useState } from "react";
import {
  SunFilledIcon,
  MoonFilledIcon,
  SystemThemeIcon,
} from "@/components/icons";
import { loadPalette } from "./themePicker";

interface ThemeSwitchProps {
  className?: string;
  classNames?: SwitchProps["classNames"];
}

const ThemeSwitch: FC<ThemeSwitchProps> = () => {
  const [theme, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      return localStorage.getItem("theme") || "system";
    } else {
      return "system";
    }
  });

  useEffect(() => {
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

  const toggleTheme = () => {
    setIsDarkMode((prevMode: string) =>
      prevMode === "light" ? "dark" : prevMode === "dark" ? "system" : "light",
    );
  };

  return (
    <div
      onClick={toggleTheme}
      className="fill-foreground-500 transition-all duration-300 ease-in-out hover:fill-foreground-600"
    >
      {theme === "dark" ? (
        <MoonFilledIcon size={22} />
      ) : theme === "light" ? (
        <SunFilledIcon size={22} />
      ) : (
        <SystemThemeIcon size={22} />
      )}
    </div>
  );
};

export default ThemeSwitch;
