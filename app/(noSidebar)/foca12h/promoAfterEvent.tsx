"use client";
import Tray from "@/components/tray";
import { Match, Team } from "@/db/matches";
import Link from "next/link";
import React from "react";

interface TeamPoints {
  [teamId: number]: number;
}

function calculateTeamPoints(matches: Match[], teams?: Team[]): TeamPoints {
  const points: TeamPoints = {};

  if (teams) {
    for (const team of teams) {
      points[team.id] = 0;
    }
  }

  const finishedMatches = matches.filter(
    (match) => match.status === "finished",
  );

  for (const match of finishedMatches) {
    if (match.team1_score > match.team2_score) {
      points[match.team1_id] = (points[match.team1_id] || 0) + 3;
    } else if (match.team1_score === match.team2_score) {
      points[match.team1_id] = (points[match.team1_id] || 0) + 1;
    }

    if (match.team2_score > match.team1_score) {
      points[match.team2_id] = (points[match.team2_id] || 0) + 3;
    } else if (match.team1_score === match.team2_score) {
      points[match.team2_id] = (points[match.team2_id] || 0) + 1;
    }
  }

  return points;
}

function getPlacementClass(index: number) {
  if (index === 0) {
    return "bg-[#EFBF04] dark:bg-[#EFBF04] shadow-xl";
  }

  if (index === 1) {
    return "bg-[#C0C0C0] dark:bg-[#C0C0C0] shadow-xl";
  }

  if (index === 2) {
    return "bg-[#CD7F32] dark:bg-[#CD7F32] shadow-xl";
  }

  return "bg-gray-300 dark:bg-gray-800 opacity-80 shadow-xl";
}

const PromoAfterEvent = () => {
  const [teams, setTeams] = React.useState<Team[]>();
  const [matches, setMatches] = React.useState<Match[]>([]);
  const [teamPoints, setTeamPoints] = React.useState<TeamPoints>({});

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

    fetch("/api/getMatches", {
      method: "GET",
      headers: {
        module: "matches",
      },
    })
      .then((res) => res.json())
      .then((data: Match[]) => {
        setMatches(data);
      });
  }, []);

  React.useEffect(() => {
    setTeamPoints(calculateTeamPoints(matches, teams));
  }, [matches, teams]);

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

  const sortedTeams = [...teams].sort((a, b) => {
    const pointsDiff = (teamPoints[b.id] || 0) - (teamPoints[a.id] || 0);
    if (pointsDiff !== 0) return pointsDiff;

    return a.full_name.localeCompare(b.full_name, "hu");
  });

  return (
    <div className="mb-4 space-y-4 text-center">
    <Tray className="space-y-2">
        <h2>19 csapat - ⁶&#129335;⁷  mérkőzés - 159 gól</h2>

        <p>
          <Link
            href="/foca12h"
            className="rounded-lg bg-selfsecondary-100 p-2 text-center font-bold hover:bg-selfsecondary-200"
          >
            ➜ A 12 órás foci eredményei ➜
          </Link>
        </p>
      </Tray>

      <div className="grid grid-cols-7 gap-2">
        {sortedTeams.map((team) => (
          <div
            key={team.id}
            className={
              "flex items-center justify-center gap-2 rounded-lg py-2 " +
              getPlacementClass(sortedTeams.findIndex((item) => item.id === team.id))
            }
          >
            <img
              className="mx-1 h-7 w-7 rounded-lg border-gray-500 shadow-2xl"
              src={team.image_url}
              alt={team.name}
            />
          </div>
        ))}
      </div>

    </div>
  );
};

export default PromoAfterEvent;
