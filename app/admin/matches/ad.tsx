"use client";
import Tray from "@/components/tray";
import { Team } from "@/db/matches";
import Link from "next/link";
import React from "react";

export function getColorClass(group: string) {
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
      .then((data) => {
        setTeams(data);
      });
  }, []);

  if (!teams)
    return (
      <div className="flex h-full items-center justify-center">Loading...</div>
    );
  if (teams.length === 0)
    return (
      <div className="flex h-full items-center justify-center">
        Nincsenek csapatok
      </div>
    );

  return (
    <div className="space-y-4 text-center">
      <div className="flex gap-2">
        {["A", "B", "C", "D", "8.-9. (X)"].map((group) => (
          <div
            key={group}
            className={
              "w-full rounded-lg p-1 text-sm font-bold " + getColorClass(group)
            }
          >
            {group}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {teams.map((team) => (
          <div
            key={team.id}
            className={
              "flex items-center justify-center gap-2 rounded-lg py-2 " +
              getColorClass(team.group_letter)
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
        <h2>Ők ott lesznek. Te ott leszel?</h2>

        <p>
          <Link
            href="/foca12h"
            className="rounded-lg bg-selfsecondary-100 p-2 text-center font-bold hover:bg-selfsecondary-200"
          >
            12 órás foci - csapatok és mérkőzések ➡
          </Link>
        </p>
      </Tray>
      <p>
        <Link
          href="https://www.instagram.com/p/DHtqCIqtCFl"
          className="-mt-2 rounded-lg bg-selfsecondary-100 p-1 text-center text-sm"
        >
          Egyéb programok ➡
        </Link>
      </p>
    </div>
  );
};

export default ManageTeams;
