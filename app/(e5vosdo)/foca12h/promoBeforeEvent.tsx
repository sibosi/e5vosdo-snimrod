"use client";
import Tray from "@/components/tray";
import { Team } from "@/db/matches";
import Link from "next/link";
import React from "react";

export function getColorClass(group: string | undefined) {
  switch (group) {
    case "A":
      return "bg-red-400 dark:bg-red-800";
    case "B":
      return "bg-blue-300 dark:bg-blue-700";
    case "C":
      return "bg-green-400 dark:bg-green-700";
    case "D":
      return "bg-yellow-400 dark:bg-yellow-600";
    case "X":
      return "bg-gray-300 dark:bg-gray-500";
    default:
      return "bg-gray-300 dark:bg-gray-500";
  }
}

const PromoBeforeEvent = ({
  areMultipleGroups,
}: {
  areMultipleGroups: boolean;
}) => {
  const [teams, setTeams] = React.useState<Team[]>();
  React.useEffect(() => {
    fetch("/api/getTeams", {
      method: "GET",
      headers: {
        module: "matches",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setTeams(data);
      });
  }, []);

  if (!teams)
    return (
      <div className="flex h-full items-center justify-center">Betöltés...</div>
    );
  if (teams.length === 0)
    return (
      <div className="flex h-full items-center justify-center">
        Nincsenek csapatok
      </div>
    );

  return (
    <div className="mb-4 space-y-2 text-center">
      <Tray className="space-y-4">
        <h2>Ők ott lesznek. És Te?</h2>

        <p>
          <Link
            href="/foca12h"
            className="rounded-lg bg-selfsecondary-100 p-2 text-center font-bold hover:bg-selfsecondary-200"
          >
            ➜ Európa Napi 12 órás foci mérkőzései ➜
          </Link>
        </p>
      </Tray>

      <div className="flex gap-2">
        {areMultipleGroups &&
          ["A", "B", "C", "D", "8.-9. (X)"].map((group) => (
            <div
              key={group}
              className={
                "w-full rounded-lg p-1 text-sm font-bold " +
                getColorClass(group)
              }
            >
              {group}
            </div>
          ))}
      </div>
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {teams.map((team) => (
          <div
            key={team.id}
            className={
              "flex flex-col items-center justify-center overflow-hidden rounded-xl border-1 border-selfsecondary-200 px-2 py-2" // +
              // getColorClass(team.group_letter)
            }
          >
            <img
              className="mx-1 mb-2 h-7 w-7 rounded-lg border-gray-500"
              src={team.image_url}
              alt={team.name}
            />
            <p className="text-xs font-bold">
              {team.full_name.split("-").pop()}
            </p>
            <p className="text-xs">{team.team_leader} vezetésével</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromoBeforeEvent;
