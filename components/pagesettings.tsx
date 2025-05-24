"use client";
import { PageSettingsType } from "@/db/pageSettings";
import { usePageSettings } from "@/hooks/usePageSettings";
import { Button, Input } from "@heroui/react";
import React, { useState } from "react";

async function editPageSettings(settings: PageSettingsType) {
  fetch("/api/editPageSettings", {
    method: "POST",
    headers: {
      module: "pageSettings",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      settings: settings,
    }),
  }).then((res) => {
    if (res.status === 200) window.location.reload();
    else alert("Hiba történt a mentés során!");
  });
}

const PageSettings = () => {
  const { pageSettings: settings, isLoading } = usePageSettings(true);
  const [newSettings, setNewSettings] = useState<PageSettingsType>(settings!);

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
            {newSettings?.headspace ? "Bekapcsolva" : "Kikapcsolva"}
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
          }}
        >
          Mentés
        </Button>
      </div>
    </div>
  );
};

export default PageSettings;
