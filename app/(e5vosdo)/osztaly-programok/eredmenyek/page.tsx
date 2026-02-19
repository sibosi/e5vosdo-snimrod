import React from "react";
import { redirect } from "next/navigation";
import { getAuth } from "@/db/dbreq";
import { gate } from "@/db/permissions";
import { getWeightedVotingResults, getVotedUsers } from "@/db/classPrograms";

// Helper functions for placement styling
const getPlacementTextColor = (index: number): string => {
  if (index === 0) return "text-yellow-600";
  if (index === 1) return "text-gray-500";
  if (index === 2) return "text-amber-600";
  return "text-foreground";
};

const getPlacementIcon = (index: number): string => {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  return `${index + 1}.`;
};

const VotingResultsPage = async () => {
  const selfUser = await getAuth();

  // Admin gate - redirect if not admin
  if (!selfUser) {
    redirect("/");
  }

  try {
    gate(selfUser, "admin");
  } catch {
    redirect("/");
  }

  // Get the voting results data
  const [weightedResults, votedUsers] = await Promise.all([
    getWeightedVotingResults(),
    getVotedUsers(),
  ]);

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <h1 className="mb-8 text-center text-4xl font-bold text-foreground">
        Osztályprogramok Szavazási Eredményei
      </h1>

      {/* Weighted Voting Results */}
      <div className="bg-card rounded-lg p-6 shadow-lg">
        <h2 className="mb-4 text-2xl font-semibold text-foreground">
          Súlyozott Eredmények
        </h2>
        <p className="text-muted-foreground mb-4 text-sm">
          A szavazatok súlyozása: 1. hely = 5 pont, 2. hely = 4 pont, 3. hely =
          3 pont, 4. hely = 2 pont, 5. hely = 1 pont
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-border border-b">
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  Helyezés
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  Program neve
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  Terem
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  Osztály
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  Pontszám
                </th>
              </tr>
            </thead>
            <tbody>
              {weightedResults.map((result, index) => (
                <tr
                  key={`${result.name}-${result.room}`}
                  className={`border-border border-b ${
                    index < 3 ? "bg-accent/20" : "hover:bg-accent/10"
                  }`}
                >
                  <td className="px-4 py-3">
                    <span
                      className={`font-bold ${
                        index === 0
                          ? "text-yellow-600"
                          : index === 1
                            ? "text-gray-500"
                            : index === 2
                              ? "text-amber-600"
                              : "text-foreground"
                      }`}
                    >
                      {index === 0
                        ? "🥇"
                        : index === 1
                          ? "🥈"
                          : index === 2
                            ? "🥉"
                            : `${index + 1}.`}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {result.name}
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {result.room}
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {result.class}
                  </td>
                  <td className="px-4 py-3 font-bold text-primary">
                    {result.weighted_vote_count || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Voting Statistics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="bg-card rounded-lg p-6 shadow-lg">
          <h3 className="mb-4 text-xl font-semibold text-foreground">
            Szavazási Statisztikák
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Összes szavazat:</span>
              <span className="font-semibold text-foreground">
                {weightedResults.reduce(
                  (sum, r) => sum + (r.weighted_vote_count || 0),
                  0,
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Szavazó felhasználók:
              </span>
              <span className="font-semibold text-foreground">
                {votedUsers.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Programok száma:</span>
              <span className="font-semibold text-foreground">
                {weightedResults.length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-lg">
          <h3 className="mb-4 text-xl font-semibold text-foreground">
            Szavazó Felhasználók ({votedUsers.length})
          </h3>
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {votedUsers.map((user, index) => (
              <div
                key={user.email}
                className="text-muted-foreground hover:bg-accent/10 rounded-sm px-2 py-1 text-sm"
              >
                {index + 1}. {user.email}
              </div>
            ))}
          </div>
          {votedUsers.length === 0 && (
            <p className="text-muted-foreground text-sm">
              Még senki nem szavazott.
            </p>
          )}
        </div>
      </div>

      {/* Admin Note */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Admin megjegyzés:</strong> Ez az oldal csak adminisztrátorok
          számára elérhető. Az eredmények valós időben frissülnek a leadott
          szavazatok alapján.
        </p>
      </div>
    </div>
  );
};

export default VotingResultsPage;
