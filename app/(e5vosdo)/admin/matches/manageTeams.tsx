"use client";
import { Team, Match, TeamCategory } from "@/db/matches";
import React from "react";

// Function to calculate team points
interface TeamPoints {
  [teamId: number]: number;
}

// Legacy function for backward compatibility with old group_letter system
// Note: This is deprecated and should not be used for new code
export function getColorClass(color: string | undefined) {
  return `bg-${color}-300 dark:bg-${color}-700 `;
}

// Helper function to get color class based on category color code
function getCategoryColorClass(colorCode: string) {
  return `bg-${colorCode}-300 dark:bg-${colorCode}-700`;
}

// Helper function to get border color class
function getBorderColorClass(colorCode: string) {
  return `border-${colorCode}-300 dark:border-${colorCode}-700`;
}

// Helper to get category by id
function getCategoryById(
  categories: TeamCategory[],
  categoryId: number,
): TeamCategory | undefined {
  return categories.find((cat) => cat.id === categoryId);
}

const ManageTeams = () => {
  const [teams, setTeams] = React.useState<Team[]>();
  const [teamPoints, setTeamPoints] = React.useState<TeamPoints>({});
  const [teamCategories, setTeamCategories] = React.useState<TeamCategory[]>(
    [],
  );

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
        // Calculate points for each team
        const points: TeamPoints = {};

        // Initialize all teams with 0 points
        if (teams) {
          for (const team of teams) {
            points[team.id] = 0;
          }
        }

        // Calculate points from finished matches
        const finishedMatches = data.filter(
          (match) => match.status === "finished",
        );
        for (const match of finishedMatches) {
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
        }

        setTeamPoints(points);
      })
      .catch((err) => {
        console.error("Error fetching matches:", err);
      });
  }, [teams]);

  React.useEffect(() => {
    fetch("/api/getTeamCategories", {
      method: "GET",
      headers: {
        module: "matches",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setTeamCategories(data);
      })
      .catch((err) => {
        console.error("Error fetching team categories:", err);
      });

    fetch("/api/getTeams", {
      method: "GET",
      headers: {
        module: "matches",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setTeams(data);
      })
      .catch((err) => {
        console.error("Error fetching teams:", err);
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

  // Group teams by category
  const teamsByCategory = teams.reduce(
    (acc, team) => {
      if (!acc[team.category_id]) {
        acc[team.category_id] = [];
      }
      acc[team.category_id].push(team);
      return acc;
    },
    {} as Record<number, Team[]>,
  );

  // Sort teams by points within each category
  const sortedTeamsByCategory = Object.entries(teamsByCategory).reduce(
    (acc, [categoryId, teamsInCategory]) => {
      acc[Number(categoryId)] = [...teamsInCategory].sort(
        (a, b) => (teamPoints[b.id] || 0) - (teamPoints[a.id] || 0),
      );
      return acc;
    },
    {} as Record<number, Team[]>,
  );

  return (
    <div className="space-y-6 text-center">
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {teamCategories.map((category) => (
          <div
            key={category.id}
            className={`min-w-[100px] flex-1 rounded-lg p-2 text-sm font-bold text-white md:text-xl ${getCategoryColorClass(
              category.color_code,
            )} `}
          >
            {category.short_name}
          </div>
        ))}
      </div>

      {/* Teams grouped by category */}
      {teamCategories.map((category) => {
        const categoryTeams = sortedTeamsByCategory[category.id] || [];
        if (categoryTeams.length === 0) return null;

        return (
          <div key={category.id} className="space-y-3">
            <h3
              className={`inline-block rounded-lg px-4 py-2 text-xl font-bold text-white bg-${category.color_code}-300`}
            >
              {category.name}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {categoryTeams.map((team) => (
                <div
                  key={team.id}
                  className={`flex items-center gap-3 rounded-lg border-l-4 bg-white p-3 shadow-md dark:bg-gray-800 max-sm:flex-col border-${category.color_code}-300`}
                >
                  {team.image_url && (
                    <img
                      className="h-12 w-12 rounded-lg object-cover"
                      src={team.image_url}
                      alt={team.name}
                    />
                  )}
                  <div className="flex-1 text-left max-sm:text-center">
                    <p className="text-lg font-semibold">{team.name}</p>
                    {team.team_leader && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {team.team_leader}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end max-sm:items-center">
                    <div className="text-2xl font-bold">
                      {teamPoints[team.id] || 0}
                    </div>
                    <div className="text-xs text-gray-500">pont</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Show message if no teams */}
      {teamCategories.every(
        (cat) => (sortedTeamsByCategory[cat.id] || []).length === 0,
      ) && (
        <div className="py-8 text-gray-500">
          Még nincsenek csapatok ebben a kategóriában
        </div>
      )}
    </div>
  );
};

export default ManageTeams;
