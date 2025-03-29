"use client";
import { Team, Match } from "@/db/matches";
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
    case "Q":
      return "bg-yellow-400 dark:bg-yellow-600";
    case "H":
      return "bg-orange-400 dark:bg-orange-600";
    case "W":
      return "bg-red-400 dark:bg-red-800";
    case "X":
      return "bg-gray-300 dark:bg-gray-500";
    default:
      return "bg-gray-300 dark:bg-gray-500";
  }
}

// Function to calculate team points
interface TeamPoints {
  [teamId: number]: number;
}

const ManageTeams = () => {
  const [teams, setTeams] = React.useState<Team[]>();
  const [matches, setMatches] = React.useState<any[]>([]);
  const [teamPoints, setTeamPoints] = React.useState<TeamPoints>({});

  React.useEffect(() => {
    // Fetch all matches
    fetch("/api/getMatches", {
      method: "GET",
      headers: {
        module: "matches",
      },
    })
      .then((res) => res.json())
      .then((data: Match[]) => {
        setMatches(data);
        
        // Calculate points for each team
        const points: TeamPoints = {};
        
        // Initialize all teams with 0 points
        teams?.forEach(team => {
          points[team.id] = 0;
        });
        
        // Calculate points from finished matches
        data.filter(match => match.status === "finished").forEach(match => {
          // Home team (team1) points
          if (match.team1_score > match.team2_score) {
            points[match.team1_id] = (points[match.team1_id] || 0) + 3;
          } else if (match.team1_score === match.team2_score) {
            points[match.team1_id] = (points[match.team1_id] || 0) + 1;
          }
          
          // Away team (team2) points
          if (match.team2_score > match.team1_score) {
            points[match.team2_id] = (points[match.team2_id] || 0) + 3;
          } else if (match.team1_score === match.team2_score) {
            points[match.team2_id] = (points[match.team2_id] || 0) + 1;
          }
        });
        
        setTeamPoints(points);
      });
  }, [teams]);
  
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
        {["A", "B", "C", "D", "X"].map((group) => (
          <div
            key={group}
            className={
              "w-full rounded-lg p-2 text-xl font-bold " + getColorClass(group)
            }
          >
            {group}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:text-left lg:grid-cols-4">
        {teams.map((team) => (
          <div
            key={team.id}
            className={
              "flex items-center gap-2 rounded-lg p-2 max-sm:flex-col " +
              getColorClass(team.group_letter)
            }
          >
            <img
              className="mx-1 h-9 w-9 rounded-lg border-gray-500"
              src={team.image_url}
              alt={team.name}
            />
            <div>
              <p className="font-semibold">{team.name}</p>
              <p className="info">{team.team_leader}</p>
            </div>
            <div className="sm:ml-auto flex flex-col sm:items-end">
              <p className="w-9 rounded-lg text-xl font-bold max-sm:hidden">
                {team.group_letter}
              </p>
              
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageTeams;