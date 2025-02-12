// components/NotificationSettings.tsx
"use client";
import React, { useEffect, useState } from "react";
import { Alert, Switch } from "@nextui-org/react";
import { UserType } from "@/db/dbreq";
import saveSettings from "./saveSettings";

const NotificationSettings = ({ selfUser }: { selfUser: UserType }) => {
  const [isPushEnabled, setIsPushEnabled] = useState<{
    value: boolean;
    reason?: string;
  }>({ value: false });

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!("Notification" in window)) {
        setIsPushEnabled({
          value: false,
          reason:
            "A böngésződ nem támogatja az értesítéseket. Használj HTTPS-t!",
        });
      } else if (Notification.permission === "denied") {
        setIsPushEnabled({
          value: false,
          reason: "A böngészőben letiltottad az értesítéseket.",
        });
      } else if (Notification.permission === "default") {
        setIsPushEnabled({
          value: false,
          reason: "Nem engedélyezted az értesítéseket a böngésződben.",
        });
      } else if (!("serviceWorker" in navigator)) {
        setIsPushEnabled({
          value: false,
          reason: "A böngésződ nem támogatja a szolgáltató munkásokat.",
        });
      } else if (!selfUser.push_permission) {
        setIsPushEnabled({
          value: false,
          reason: "Az értesítések nincsenek engedélyezve a profilodban.",
        });
      } else {
        setIsPushEnabled({ value: true });
      }
    }
  }, [selfUser.push_permission]);

  return (
    <div>
      {isPushEnabled.reason && (
        <Alert className="border-selfsecondary-400 bg-selfsecondary-200">
          {isPushEnabled.reason}
        </Alert>
      )}
      <div className="grid grid-cols-1 gap-2">
        <Switch
          isSelected={isPushEnabled.value}
          onChange={(e) => {
            if (e.target.checked) {
              Notification.requestPermission();
              saveSettings({ settings: { push_permission: true } });
            } else {
              saveSettings({ settings: { push_permission: false } });
            }
          }}
        >
          Értesítések engedélyezése
        </Switch>

        <Switch
          isSelected={selfUser.push_about_games}
          isDisabled={!isPushEnabled.value}
          onChange={(e) => {
            saveSettings({ settings: { push_about_games: e.target.checked } });
          }}
        >
          Értesítések bajnokságokról (kosár, foci, stb.)
        </Switch>

        <Switch
          isSelected={selfUser.push_about_timetable}
          isDisabled={!isPushEnabled.value}
          onChange={(e) => {
            saveSettings({
              settings: { push_about_timetable: e.target.checked },
            });
          }}
        >
          Értesítések az órarend változásakor (funkció előreláthatólag nem fog
          megvalósulni)
        </Switch>
      </div>
    </div>
  );
};

export default NotificationSettings;
