"use client";
import React, { useState } from "react";
import { Radio, RadioGroup, Switch } from "@heroui/react";
import ThemePicker, { ThemeOptions } from "@/components/themePicker";
import { Section } from "@/components/home/section";

const AppearanceSettings = () => {
  const [theme, setTheme] = useState<string>(
    localStorage.getItem("theme") || "system",
  );
  const [isMaterialBg, setIsMaterialBg] = useState<boolean>(
    localStorage.getItem("materialBg") === "true",
  );
  const [isSnowing, setIsSnowing] = useState<boolean>(
    localStorage.getItem("hideSnowfall") !== "true",
  );

  return (
    <div className="">
      <Section title="Téma" titleClassName="text-lg font-semibold">
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
      </Section>

      <Section title="Téli hangulat ❄️" titleClassName="text-lg font-semibold">
        <Switch
          isSelected={isSnowing}
          onChange={() => {
            localStorage.setItem("hideSnowfall", isSnowing ? "true" : "false");
            setIsSnowing(!isSnowing);
            location.reload();
          }}
        >
          Havazás
        </Switch>
      </Section>

      <Section title="Színséma" titleClassName="text-lg font-semibold">
        <div className="space-y-2">
          <Switch
            isSelected={isMaterialBg}
            onChange={() => {
              localStorage.setItem(
                "materialBg",
                isMaterialBg ? "false" : "true",
              );
              setIsMaterialBg(!isMaterialBg);
              location.reload();
            }}
          >
            Színes háttér
          </Switch>
          <ThemeOptions className="flex flex-initial flex-row gap-4 overflow-x-auto" />
          <Section
            title="Egyéni színek"
            titleClassName="text-lg  font-semibold"
            savable={false}
            dropdownable
            defaultStatus="closed"
          >
            <ThemePicker colorName="primary" />
            <ThemePicker colorName="secondary" />
          </Section>
        </div>
      </Section>
    </div>
  );
};

export default AppearanceSettings;
