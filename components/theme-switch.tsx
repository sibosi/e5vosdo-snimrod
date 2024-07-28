"use client";

import { FC } from "react";
import { SwitchProps } from "@nextui-org/switch";
import { useEffect, useState } from "react";
import {
  SunFilledIcon,
  MoonFilledIcon,
  SystemThemeIcon,
} from "@/components/icons";

export interface ThemeSwitchProps {
  className?: string;
  classNames?: SwitchProps["classNames"];
}

export const ThemeSwitch: FC<ThemeSwitchProps> = () => {
  const [theme, setIsDarkMode] = useState(localStorage.theme);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.theme = "light";
    } else {
      localStorage.theme = "system";
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.remove("light");
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setIsDarkMode((prevMode: string) =>
      prevMode === "light" ? "dark" : prevMode === "dark" ? "system" : "light"
    );
  };

  return (
    <div
      onClick={toggleTheme}
      className="transition-all duration-300 ease-in-out fill-foreground-500 hover:fill-foreground-600"
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
