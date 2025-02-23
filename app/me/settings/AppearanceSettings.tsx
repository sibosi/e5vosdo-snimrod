"use client";
import React, { useState } from "react";
import { Radio, RadioGroup, Switch } from "@heroui/react";
import ThemePicker, { ThemeOptions } from "@/components/themePicker";

const AppearanceSettings = () => {
  const [theme, setTheme] = useState<string>(
    localStorage.getItem("theme") || "system",
  );
  const [isMaterialBg, setIsMaterialBg] = useState<boolean>(
    localStorage.getItem("materialBg") === "true",
  );

  return (
    <div className="space-y-4">
      <RadioGroup
        value={theme}
        onChange={(e) => {
          localStorage.setItem("theme", e.target.value);
          setTheme(e.target.value);
          location.reload();
        }}
      >
        <Radio value="system">Rendszer</Radio>
        <Radio value="light">Világos</Radio>
        <Radio value="dark">Sötét</Radio>
      </RadioGroup>

      <ThemeOptions />
      <ThemePicker colorName="primary" />
      <ThemePicker colorName="secondary" />

      <Switch
        isSelected={isMaterialBg}
        onChange={() => {
          localStorage.setItem("materialBg", isMaterialBg ? "false" : "true");
          setIsMaterialBg(!isMaterialBg);
          location.reload();
        }}
      >
        Színes háttér
      </Switch>
    </div>
  );
};

export default AppearanceSettings;
