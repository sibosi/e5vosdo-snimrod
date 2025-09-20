"use client";

import React, { FC, useState } from "react";
import { SwitchProps } from "@heroui/switch";
import {
  SunFilledIcon,
  MoonFilledIcon,
  SystemThemeIcon,
} from "@/components/icons";
import { reloadColors } from "@/app/runClientSide";

interface ThemeSwitchProps {
  text?: string;
  className?: string;
  classNames?: SwitchProps["classNames"];
}

const ThemeSwitch: FC<ThemeSwitchProps> = () => {
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const storedValue = localStorage.getItem("theme");
      return storedValue
        ? (storedValue as "light" | "dark" | "system")
        : "system";
    } else {
      return "system";
    }
  });

  React.useEffect(() => {
    reloadColors(theme);
  }, [theme]);

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <button
      onClick={toggleTheme}
      className={`fill-foreground-500 transition-all duration-300 ease-in-out hover:fill-foreground-600 ${className}`}
    >
      {theme === "dark" && <MoonFilledIcon size={22} />}
      {theme === "light" && <SunFilledIcon size={22} />}{" "}
      {theme !== "dark" && theme !== "light" && <SystemThemeIcon size={22} />}
    </button>
  );
};

export default ThemeSwitch;
