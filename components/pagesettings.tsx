"use client";
import { PageSettingsType } from "@/db/pageSettings";
import { Button, Input } from "@heroui/react";
import React, { useEffect, useState } from "react";

async function getPageSettings() {
  return await fetch("/api/getPageSettings")
    .then((res) => res.json())
    .then((data) => {
      return data as PageSettingsType;
    });
}

async function editPageSettings(settings: PageSettingsType) {
  return await fetch("/api/editPageSettings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      settings: settings,
    }),
  });
}

const PageSettings = () => {
  const [settings, setSettings] = useState<PageSettingsType>();
  const [edit, setEdit] = useState(false);

  const [newSettings, setNewSettings] = useState<PageSettingsType>(
    {} as PageSettingsType,
  );

  useEffect(() => {
    getPageSettings().then((data) => {
      setSettings(data);
      setNewSettings(data);
    });
  }, []);

  return (
    <div className="flex flex-wrap gap-2 rounded-lg bg-selfprimary-100 p-4 text-foreground">
      <div className="p-2">
        <h1 className="text-2xl font-semibold">Oldal beállítások</h1>
        <p>ID: {settings?.id}</p>
        <p>Név: {settings?.name}</p>
        <p>Headspace: {settings?.headspace}</p>
        <p>Livescore ID : {settings?.livescore}</p>
        <div className="my-2 flex flex-col gap-1 rounded-lg bg-selfprimary-200 p-2">
          <h2>{edit ? "Szerkesztés" : "Oldal beállítások szerkesztése"}</h2>
          <div className="flex gap-2">
            <Input
              title="name"
              placeholder="Név"
              label="Név (now)"
              size="sm"
              value={newSettings?.name}
              onChange={(e) =>
                setNewSettings({ ...newSettings, name: e.target.value })
              }
            />
            <Button
              size="lg"
              className="w-full"
              onPress={() =>
                setNewSettings({
                  ...newSettings,
                  headspace: newSettings.headspace ? 0 : 1,
                })
              }
            >
              {newSettings.headspace ? "Bekapcsolva" : "Kikapcsolva"}
            </Button>
            <Input
              title="livescore"
              placeholder="Livescore ID"
              size="sm"
              label="Livescore ID"
              type="number"
              value={String(newSettings?.livescore)}
              onChange={(e) =>
                setNewSettings({
                  ...newSettings,
                  livescore: Number(e.target.value),
                })
              }
            />
          </div>

          <Button
            size="sm"
            onPress={() => {
              editPageSettings(newSettings);
              setSettings(newSettings);
            }}
          >
            Mentés
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PageSettings;
