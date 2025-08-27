"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Switch } from "@heroui/react";
import { UserType } from "@/db/dbreq";
import { Alert } from "@/components/home/alert";

const NotificationSettings = ({
  selfUser,
  setReloadNeeded,
}: {
  selfUser: UserType;
  setReloadNeeded: (value: boolean) => void;
}) => {
  const [isPushEnabled, setIsPushEnabled] = useState<boolean>(
    selfUser.push_permission,
  );
  const [isPushAboutGames, setIsPushAboutGames] = useState<boolean>(
    selfUser.push_about_games,
  );
  const [isPushAboutTimetable, setIsPushAboutTimetable] = useState<boolean>(
    selfUser.push_about_timetable,
  );
  const [error, setError] = useState<string | null>(null);
  const [initialSettings] = useState(() => ({
    push_permission: selfUser.push_permission,
    push_about_games: selfUser.push_about_games,
    push_about_timetable: selfUser.push_about_timetable,
  }));

  const hasChanged = useMemo(() => {
    const currentSettings = {
      push_permission: isPushEnabled,
      push_about_games: isPushAboutGames,
      push_about_timetable: isPushAboutTimetable,
    };
    return JSON.stringify(currentSettings) !== JSON.stringify(initialSettings);
  }, [isPushEnabled, isPushAboutGames, isPushAboutTimetable, initialSettings]);

  async function saveSettings(
    settings: {
      push_permission?: boolean;
      push_about_games?: boolean;
      push_about_timetable?: boolean;
    },
    setState: () => void,
  ) {
    const hasGeneralChanged =
      settings.push_permission !== undefined &&
      settings.push_permission != isPushEnabled;
    const hasGamesChanged =
      settings.push_about_games !== undefined &&
      settings.push_about_games != isPushAboutGames;
    const hasTimetableChanged =
      settings.push_about_timetable !== undefined &&
      settings.push_about_timetable != isPushAboutTimetable;
    if (!hasGeneralChanged && !hasGamesChanged && !hasTimetableChanged) return;

    fetch("/api/editMySettings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    }).then((response) => {
      if (response.ok) {
        setState();
        const value = {
          push_permission: isPushEnabled,
          push_about_games: isPushAboutGames,
          push_about_timetable: isPushAboutTimetable,
        };
        console.log("New notification settings:", value);
        console.log("Initial settings:", initialSettings);
        setReloadNeeded(hasChanged);
      } else alert("Hiba történt a mentés során.");
    });
  }

  useEffect(() => {
    if (!("Notification" in window)) {
      setError("A böngésződ nem támogatja az értesítéseket. Használj HTTPS-t!");
    } else if (Notification.permission === "denied") {
      setError("A böngészőben letiltottad az értesítéseket.");
    } else if (Notification.permission === "default") {
      setError("Nem engedélyezted az értesítéseket a böngésződben.");
    } else if (!("serviceWorker" in navigator)) {
      setError("A böngésződ nem támogatja a szolgáltató munkásokat.");
    }
  }, [selfUser.push_permission]);

  return (
    <div>
      {error && (
        <Alert className="border-selfsecondary-400 bg-selfsecondary-200">
          {error}
        </Alert>
      )}
      <div className="grid grid-cols-1 gap-2">
        <Switch
          isSelected={isPushEnabled}
          onValueChange={(checked) => {
            if (checked) Notification.requestPermission();
            saveSettings({ push_permission: checked }, () => {
              setIsPushEnabled(checked);
            });
          }}
        >
          Értesítések engedélyezése
        </Switch>

        <Switch
          isSelected={isPushAboutGames}
          isDisabled={!isPushEnabled}
          onValueChange={(checked) => {
            saveSettings({ push_about_games: checked }, () => {
              setIsPushAboutGames(checked);
            });
          }}
        >
          Értesítések bajnokságokról (kosár, foci, stb.)
        </Switch>

        <Switch
          className="hidden"
          isSelected={isPushAboutTimetable}
          isDisabled={!isPushEnabled}
          onValueChange={(checked) => {
            saveSettings({ push_about_timetable: checked }, () => {
              setIsPushAboutTimetable(checked);
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
