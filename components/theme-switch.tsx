"use client";

import { FC } from "react";
import { SwitchProps } from "@heroui/switch";
import { useState } from "react";
import {
  SunFilledIcon,
  MoonFilledIcon,
  SystemThemeIcon,
} from "@/components/icons";

interface ThemeSwitchProps {
  className?: string;
  classNames?: SwitchProps["classNames"];
}

const ThemeSwitch: FC<ThemeSwitchProps> = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      return localStorage.getItem("theme") || "system";
    } else {
      return "system";
    }
  });

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <button
      onClick={toggleTheme}
      className="fill-foreground-500 transition-all duration-300 ease-in-out hover:fill-foreground-600"
    >
      {theme === "dark" && <MoonFilledIcon size={22} />}
      {theme === "light" && <SunFilledIcon size={22} />}{" "}
      {theme !== "dark" && theme !== "light" && <SystemThemeIcon size={22} />}
    </button>
  );
};

export default ThemeSwitch;
