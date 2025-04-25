"use client";
import Tray from "@/components/tray";
import { Team } from "@/db/matches";
import Link from "next/link";
import React from "react";

export function getColorClass(name: string) {
  switch (name) {
    case "Bulgária":
      return "bg-yellow-400 dark:bg-yellow-600 shadow-lg";
    case "Litvánia":
      return "bg-gray-300 dark:bg-gray-400 shadow-lg";
    case "Belgium":
      return "bg-orange-400 dark:bg-orange-600 shadow-lg";
    case "Svédország":
      return "bg-blue-400 dark:bg-blue-600 shadow-lg";
    default:
      return "bg-gray-400 dark:bg-gray-600";
  }
}

const ManageTeams = () => {
  const [teams, setTeams] = React.useState<Team[]>();
  React.useEffect(() => {
    fetch("/api/getTeams", {
      method: "GET",
      headers: {
        module: "matches",
      },
    })
      .then((res) => res.json())
      .then((data: Team[]) => {
        setTeams(
          data.filter(
            (team) => team.name !== "Csapat1" && team.name !== "Csapat2",
          ),
        );
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
    <div className="mb-4 space-y-4 text-center">
      <div className="grid grid-cols-7 gap-2">
        {teams.map((team) => (
          <div
            key={team.id}
            className={
              "flex items-center justify-center gap-2 rounded-lg py-2 " +
              getColorClass(team.name)
            }
          >
            <img
              className="mx-1 h-7 w-7 rounded-lg border-gray-500"
              src={team.image_url}
              alt={team.name}
            />
          </div>
        ))}
      </div>
      <Tray className="space-y-2">
        <h2>21 csapat - 70 mérkőzés - közel 160 gól</h2>

        <p>
          <Link
            href="/foca12h"
            className="rounded-lg bg-selfsecondary-100 p-2 text-center font-bold hover:bg-selfsecondary-200"
          >
            12 órás foci eredményei ➡
          </Link>
        </p>
      </Tray>
    </div>
  );
};

export default ManageTeams;
