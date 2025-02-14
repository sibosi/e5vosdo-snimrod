"use client";
import React, { useState } from "react";
import { Switch } from "@nextui-org/react";
import ThemePicker, { ThemeOptions } from "@/components/themePicker";

const AppearanceSettings = () => {
  const [isMaterialBg, setIsMaterialBg] = useState<boolean>(
    localStorage.getItem("materialBg") === "true",
  );

  return (
    <div className="space-y-4">
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
