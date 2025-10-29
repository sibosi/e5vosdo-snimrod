"use client";
import { Match, Team, TeamCategory } from "@/db/matches";
import React, { useState, useEffect } from "react";
import { getColorClass } from "./manageTeams";
import { Button } from "@heroui/react";
import "@/components/navbar/headspace/timer.css";
import CreateEditMatch from "./createEditMatch";
import { Section } from "@/components/home/section";
import { getMatchStage } from "@/app/(e5vosdo)/foca12h/live/livescoreFull";

function getBetweenContent(match: Match) {
  switch (match.status) {
    case "pending":
      return (
        <div className="text-md text-gray-500">
          {getMatchStage(match, "2xl")}
          <p className="text-xl font-bold">vs</p>
          <p className="">
            {new Date(match.datetime).toLocaleTimeString("hu-HU", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      );
    case "live":
      return (
        <div>
          {getMatchStage(match, "2xl")}
          <p className="text-xl font-bold">
            {match.team1_score} - {match.team2_score}
          </p>
          <div className="h-1 w-full overflow-hidden">
            <div className="animate-grow-line-x mx-auto h-full w-1/2 bg-green-500"></div>
          </div>
        </div>
      );
    case "finished":
      return (
        <div>
          {getMatchStage(match, "2xl")}
          <p className="text-3xl font-bold">
            {match.team1_score} - {match.team2_score}
          </p>
        </div>
      );
    default:
      return <span className="text-sm text-gray-500">Unknown</span>;
  }
}

const ManageMatches = ({
  isOrganiser = false,
}: {
  isOrganiser?: boolean;
} = {}) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>();
  const [categories, setCategories] = useState<TeamCategory[]>([]);
  const [matchFilter, setMatchFilter] = useState<Team[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<TeamCategory[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | undefined>();

  useEffect(() => {
    let eventSource: EventSource;
    let retryCount = 0;
    const maxRetryCount = 5;
    const baseRetryDelay = 1000;

    const connectToSSE = () => {
      eventSource = new EventSource("/api/livescore");

      eventSource.onopen = () => {
        retryCount = 0; // Reset retry count on successful connection
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle initial connection message
          if (
            data.message &&
            data.message === "Match score SSE connection established"
          ) {
            return;
          }

          // Handle initial full data
          if (data.initialData) {
            setMatches(
              (data.initialData as Match[]).toSorted((a, b) =>
                a.datetime.localeCompare(b.datetime),
              ),
            );
            return;
          }

          // Handle delta updates
          if (data.changed || data.added || data.removed) {
            setMatches((currentMatches) => {
              // Create a new copy of the matches array
              let updatedMatches = [...currentMatches];

              // Process removed matches
              if (data.removed && data.removed.length > 0) {
                // Filter out removed matches
                const removedIds = new Set(data.removed);
                updatedMatches = updatedMatches.filter(
                  (m) => !removedIds.has(m.id),
                );
              }

              // Process added matches
              if (data.added && data.added.length > 0) {
                updatedMatches = [...updatedMatches, ...data.added];
              }

              // Process changed matches
              if (data.changed && data.changed.length > 0) {
                // Update changed matches
                const matchMap = new Map(updatedMatches.map((m) => [m.id, m]));

                for (const changedMatch of data.changed) {
                  matchMap.set(changedMatch.id, changedMatch);
                }

                updatedMatches = Array.from(matchMap.values());
              }

              // Sort the matches
              return updatedMatches.toSorted((a, b) =>
                a.datetime.localeCompare(b.datetime),
              );
            });
          }
        } catch (error) {
          console.error("Error parsing SSE data:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE Error:", error);
        eventSource.close();

        if (retryCount < maxRetryCount) {
          // Calculate exponential backoff delay with jitter
          const delay = Math.min(
            baseRetryDelay * Math.pow(2, retryCount) + Math.random() * 1000,
            30000,
          );
          retryCount++;

          console.log(
            `Attempting to reconnect (${retryCount}/${maxRetryCount}) after ${Math.round(delay / 1000)}s`,
          );
          setTimeout(connectToSSE, delay);
        } else {
          console.error("Max retry attempts reached. Please refresh the page.");
        }
      };
    };

    // Initial connection
    connectToSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  useEffect(() => {
    fetch("/api/getTeamCategories", {
      method: "GET",
      headers: {
        module: "matches",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
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

    fetch("/api/getMatches", {
      method: "GET",
      headers: {
        module: "matches",
      },
    })
      .then((res) => res.json())
      .then((data: Match[]) => {
        setMatches(
          data.toSorted((a, b) => a.datetime.localeCompare(b.datetime)),
        );
      })
      .catch((err) => {
        console.error("Error fetching matches:", err);
      });
  }, []);

  function updateMatch(match: Match) {
    fetch("/api/editMatch", {
      method: "POST",
      headers: {
        module: "matches",
      },
      body: JSON.stringify({
        match: match,
      }),
    });
  }

  function createMatch(match: Match) {
    fetch("/api/createMatch", {
      method: "POST",
      headers: {
        module: "matches",
      },
      body: JSON.stringify({
        match: match,
      }),
    }).then((res) => {
      if (res.ok) {
        setIsCreateModalOpen(false);
      }
    });
  }

  function deleteMatch(matchId: number) {
    if (confirm("Biztosan törölni szeretnéd ezt a meccset?")) {
      fetch("/api/deleteMatch", {
        method: "POST",
        headers: {
          module: "matches",
        },
        body: JSON.stringify({
          id: matchId,
        }),
      });
    }
  }

  function handleSaveMatch(match: Match) {
    if (currentMatch?.id) {
      // Editing existing match
      updateMatch(match);
      setIsEditModalOpen(false);
    } else {
      // Creating new match
      createMatch(match);
      setIsCreateModalOpen(false);
    }
    setCurrentMatch(undefined);
  }

  if (!teams)
    return (
      <div className="flex h-full items-center justify-center">Betöltés...</div>
    );

  return (
    <div className="space-y-4">
      {isOrganiser && (
        <div className="mb-4 flex justify-between">
          <h2 className="text-xl font-bold">Meccsek kezelése</h2>
          <Button
            color="primary"
            onPress={() => {
              setCurrentMatch(undefined);
              setIsCreateModalOpen(true);
            }}
          >
            Új meccs létrehozása
          </Button>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 overflow-auto overflow-x-auto">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          className="m-auto min-w-fit"
          viewBox="0 0 16 16"
        >
          <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5z" />
        </svg>
        {categories?.map((category) => (
          <button
            key={category.id}
            className={
              "min-w-fit rounded-lg px-3 py-1 text-sm font-bold " +
              getColorClass(category.color_code) +
              (categoryFilter.includes(category) ? "" : " opacity-15")
            }
            onClick={() => {
              if (categoryFilter.includes(category)) {
                setCategoryFilter(categoryFilter.filter((c) => c !== category));
              } else {
                setCategoryFilter([...categoryFilter, category]);
              }
            }}
          >
            {category.short_name}
          </button>
        ))}
      </div>

      {/* Team Filter */}
      <div className="flex gap-2 overflow-auto overflow-x-auto">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          className="m-auto min-w-fit"
          viewBox="0 0 16 16"
        >
          <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5z" />
        </svg>
        {teams?.map((team) => (
          <button
            key={team.id}
            className={
              "min-w-fit rounded-lg p-1 text-xl font-bold " +
              getColorClass(
                categories.find((cat) => cat.id === team.category_id)
                  ?.color_code || "",
              ) +
              (matchFilter.includes(team) ? "" : " opacity-15")
            }
            onClick={() => {
              if (matchFilter.includes(team)) {
                setMatchFilter(matchFilter.filter((t) => t !== team));
              } else {
                setMatchFilter([...matchFilter, team]);
              }
            }}
          >
            {team.image_url && (
              <img
                className="h-6 w-6 rounded-lg border-gray-500"
                src={team.image_url}
                alt={team.name}
              />
            )}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        <Section
          title="Korábbi meccsek"
          className="space-y-4 rounded-lg border-2 border-selfprimary"
          dropdownable={true}
          defaultStatus="opened"
          savable={false}
        >
          <div className="space-y-4">
            {matches
              .filter((match) => {
                // Category filter
                if (categoryFilter.length > 0) {
                  if (
                    !categoryFilter.some((cat) => cat.id === match.category_id)
                  ) {
                    return false;
                  }
                }
                // Team filter
                if (matchFilter.length === 0) return true;
                return (
                  matchFilter.some((team) => team.id === match.team1_id) ||
                  matchFilter.some((team) => team.id === match.team2_id)
                );
              })
              .filter((match) => match.status === "finished")
              .map((match) => (
                <div key={match.id}>
                  <div
                    className={
                      "grid grid-cols-3 items-center justify-between gap-2 rounded-lg p-2 text-center " +
                      getColorClass(
                        categories.find((cat) => cat.id === match.category_id)
                          ?.color_code || "",
                      )
                    }
                  >
                    <div className="flex flex-col items-center justify-center">
                      {teams?.find((team) => team.id === match.team1_id)
                        ?.image_url && (
                        <img
                          className="mx-1 h-9 w-9 rounded-lg border-gray-500"
                          src={
                            teams?.find((team) => team.id === match.team1_id)
                              ?.image_url
                          }
                          alt={
                            teams?.find((team) => team.id === match.team1_id)
                              ?.name
                          }
                        />
                      )}
                      <span>
                        {
                          teams?.find((team) => team.id === match.team1_id)
                            ?.name
                        }
                      </span>
                    </div>
                    <div>{getBetweenContent(match)}</div>
                    <div className="flex flex-col items-center justify-center">
                      {teams?.find((team) => team.id === match.team2_id)
                        ?.image_url && (
                        <img
                          className="mx-1 h-9 w-9 rounded-lg border-gray-500"
                          src={
                            teams?.find((team) => team.id === match.team2_id)
                              ?.image_url
                          }
                          alt={
                            teams?.find((team) => team.id === match.team2_id)
                              ?.name
                          }
                        />
                      )}
                      <span>
                        {
                          teams?.find((team) => team.id === match.team2_id)
                            ?.name
                        }
                      </span>
                    </div>
                  </div>
                  {isOrganiser && (
                    <div className="mt-1 flex flex-wrap justify-between gap-y-1">
                      <Button
                        color="primary"
                        className=""
                        size="sm"
                        onPress={() => {
                          const updatedMatch: Match = {
                            ...match,
                            team1_score: match.team1_score + 1,
                          };
                          updateMatch(updatedMatch);
                        }}
                      >
                        +1
                      </Button>
                      <Button
                        className=""
                        size="sm"
                        onPress={() => {
                          const updatedMatch: Match = {
                            ...match,
                            team1_score: 0,
                            team2_score: 0,
                            status: "pending",
                          };
                          updateMatch(updatedMatch);
                        }}
                      >
                        Reset
                      </Button>
                      <Button
                        className=""
                        size="sm"
                        onPress={() => {
                          const updatedMatch: Match = {
                            ...match,
                            start_time: new Date().toISOString(),
                            status: "live",
                          };
                          updateMatch(updatedMatch);
                        }}
                      >
                        Start
                      </Button>
                      <Button
                        className=""
                        size="sm"
                        onPress={() => {
                          const updatedMatch: Match = {
                            ...match,
                            status: "finished",
                          };
                          updateMatch(updatedMatch);
                        }}
                      >
                        Finish
                      </Button>
                      <Button
                        color="primary"
                        className=""
                        size="sm"
                        onPress={() => {
                          const updatedMatch: Match = {
                            ...match,
                            team2_score: match.team2_score + 1,
                          };
                          updateMatch(updatedMatch);
                        }}
                      >
                        +1
                      </Button>
                      <Button
                        color="secondary"
                        className=""
                        size="sm"
                        onPress={() => {
                          setCurrentMatch(match);
                          setIsEditModalOpen(true);
                        }}
                      >
                        Szerkesztés
                      </Button>
                      <Button
                        color="danger"
                        className=""
                        size="sm"
                        onPress={() => deleteMatch(match.id)}
                      >
                        Törlés
                      </Button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </Section>
        {matches
          .filter((match) => {
            // Category filter
            if (categoryFilter.length > 0) {
              if (!categoryFilter.some((cat) => cat.id === match.category_id)) {
                return false;
              }
            }
            // Team filter
            if (matchFilter.length === 0) return true;
            return (
              matchFilter.some((team) => team.id === match.team1_id) ||
              matchFilter.some((team) => team.id === match.team2_id)
            );
          })
          .filter((match) => match.status !== "finished")
          .map((match) => (
            <div key={match.id}>
              <div
                className={
                  "grid grid-cols-3 items-center justify-between gap-2 rounded-lg p-2 text-center " +
                  getColorClass(
                    categories.find((cat) => cat.id === match.category_id)
                      ?.color_code || "",
                  )
                }
              >
                <div className="flex flex-col items-center justify-center">
                  {teams?.find((team) => team.id === match.team1_id)
                    ?.image_url && (
                    <img
                      className="mx-1 h-9 w-9 rounded-lg border-gray-500"
                      src={
                        teams?.find((team) => team.id === match.team1_id)
                          ?.image_url
                      }
                      alt={
                        teams?.find((team) => team.id === match.team1_id)?.name
                      }
                    />
                  )}
                  <span>
                    {teams?.find((team) => team.id === match.team1_id)?.name}
                  </span>
                </div>
                <div>{getBetweenContent(match)}</div>
              </div>
              {isOrganiser && (
                <div className="mt-1 flex flex-wrap justify-between gap-y-1">
                  <Button
                    color="primary"
                    className=""
                    size="sm"
                    onPress={() => {
                      const updatedMatch: Match = {
                        ...match,
                        team1_score: match.team1_score + 1,
                      };
                      updateMatch(updatedMatch);
                    }}
                  >
                    +1
                  </Button>
                  <Button
                    className=""
                    size="sm"
                    onPress={() => {
                      const updatedMatch: Match = {
                        ...match,
                        team1_score: 0,
                        team2_score: 0,
                        status: "pending",
                      };
                      updateMatch(updatedMatch);
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    className=""
                    size="sm"
                    onPress={() => {
                      const updatedMatch: Match = {
                        ...match,
                        start_time: new Date().toISOString(),
                        status: "live",
                      };
                      updateMatch(updatedMatch);
                    }}
                  >
                    Start
                  </Button>
                  <Button
                    className=""
                    size="sm"
                    onPress={() => {
                      const updatedMatch: Match = {
                        ...match,
                        status: "finished",
                      };
                      updateMatch(updatedMatch);
                    }}
                  >
                    Finish
                  </Button>
                  <Button
                    color="primary"
                    className=""
                    size="sm"
                    onPress={() => {
                      const updatedMatch: Match = {
                        ...match,
                        team2_score: match.team2_score + 1,
                      };
                      updateMatch(updatedMatch);
                    }}
                  >
                    +1
                  </Button>
                  <Button
                    color="secondary"
                    className=""
                    size="sm"
                    onPress={() => {
                      setCurrentMatch(match);
                      setIsEditModalOpen(true);
                    }}
                  >
                    Szerkesztés
                  </Button>
                  <Button
                    color="danger"
                    className=""
                    size="sm"
                    onPress={() => deleteMatch(match.id)}
                  >
                    Törlés
                  </Button>
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Meccs létrehozása modal */}
      <CreateEditMatch
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveMatch}
        teams={teams}
        categories={categories}
      />

      {/* Meccs szerkesztése modal */}
      <CreateEditMatch
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveMatch}
        matchToEdit={currentMatch}
        teams={teams}
        categories={categories}
      />

      <div className="hidden">
        <div className="bg-primary-300" />
        <div className="bg-secondary-300" />
        <div className="bg-success-300" />
        <div className="bg-warning-300" />
        <div className="bg-foreground-300" />
        <div className="bg-primary-700" />
        <div className="bg-secondary-700" />
        <div className="bg-success-700" />
        <div className="bg-warning-700" />
        <div className="bg-foreground-700" />

        <div className="border-primary-300" />
        <div className="border-secondary-300" />
        <div className="border-success-300" />
        <div className="border-warning-300" />
        <div className="border-foreground-300" />
        <div className="border-primary-700" />
        <div className="border-secondary-700" />
        <div className="border-success-700" />
        <div className="border-warning-700" />
        <div className="border-foreground-700" />
      </div>
    </div>
  );
};

export default ManageMatches;
