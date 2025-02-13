"use client";
import React, { useState } from "react";
import { Button } from "@nextui-org/react";
import {
  ThemeOptions,
  ThemeTemplatePrimary,
  ThemeTemplateSecondary,
} from "@/components/themePicker";

const AppearanceSettings = () => {
  const [isMaterialBg, setIsMaterialBg] = useState<boolean>(
    localStorage.getItem("materialBg") === "true",
  );

  return (
    <div>
      <ThemeOptions />
      <ThemeTemplatePrimary />
      <ThemeTemplateSecondary />
      <Button
        onPress={() => {
          localStorage.setItem("materialBg", isMaterialBg ? "false" : "true");
          setIsMaterialBg(!isMaterialBg);
          location.reload();
        }}
        className="fill-selfprimary"
      >
        {isMaterialBg
          ? "Színes háttér kikapcsolása"
          : "Színes háttér bekapcsolása"}
      </Button>
    </div>
  );
};

export default AppearanceSettings;
