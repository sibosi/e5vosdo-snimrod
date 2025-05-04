"use client";
import { PageSettingsType } from "@/db/pageSettings";
import { Button, Input } from "@heroui/react";
import React, { useEffect, useState } from "react";

async function getPageSettings() {
  return await fetch("/api/getPageSettings", {
    method: "GET",
    headers: {
      module: "pageSettings",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      return data as PageSettingsType;
    });
}

async function editPageSettings(settings: PageSettingsType) {
  return await fetch("/api/editPageSettings", {
    method: "POST",
    headers: {
      module: "pageSettings",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      settings: settings,
    }),
  });
}

const PageSettings = () => {
  const [settings, setSettings] = useState<PageSettingsType>();
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
    <div className="space-y-2">
      <div>
        <p>ID: {settings?.id}</p>
        <p>Név: {settings?.name}</p>
        <p>Headspace: {settings?.headspace}</p>
        <p>Livescore ID : {settings?.livescore}</p>
      </div>
      <div className="space-y-2 border-t border-selfprimary">
        <h2>Szerkesztés</h2>
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
          className="w-full"
          color="primary"
          onPress={() => {
            editPageSettings(newSettings);
            setSettings(newSettings);
          }}
        >
          Mentés
        </Button>
      </div>
    </div>
  );
};

export default PageSettings;
