"use client";
import { Match, Team } from "@/db/matches";
import React, { useState, useEffect } from "react";
import { getColorClass } from "./manageTeams";
import { Button } from "@heroui/react";
import "@/components/navbar/headspace/timer.css";
import CreateEditMatch from "./createEditMatch";

function getBetweenContent(match: Match) {
  switch (match.status) {
    case "pending":
      return (
        <div className="text-md text-gray-500">
          <p className="">
            {new Date(match.datetime).toLocaleTimeString("hu-HU", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p className="text-xl font-bold">vs</p>
        </div>
      );
    case "live":
      return (
        <div>
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
        <p className="text-3xl font-bold">
          {match.team1_score} - {match.team2_score}
        </p>
      );
    default:
      return <span className="text-sm text-gray-500">Unknown</span>;
  }
}

const ManageMatches = (
  {
    isOrganiser,
  }: {
    isOrganiser: boolean;
  } = { isOrganiser: false },
) => {
  const [matches, setMatches] = useState<Match[]>();
  const [teams, setTeams] = useState<Team[]>();
  const [matchFilter, setMatchFilter] = useState<Team[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | undefined>();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource("/api/livescore");

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (!data.message) {
          setMatches(
            (data as Match[]).toSorted((a, b) =>
              a.datetime.localeCompare(b.datetime),
            ),
          );
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      setIsConnected(false);
      eventSource.close();
      setTimeout(() => {
        setIsConnected(false);
      }, 5000);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
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

  if (!matches)
    return (
      <div className="flex h-full items-center justify-center">Loading...</div>
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
              getColorClass(team.group_letter) +
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
            <img
              className="h-6 w-6 rounded-lg border-gray-500"
              src={team.image_url}
              alt={team.name}
            />
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {matches
          .filter((match) => {
            if (matchFilter.length === 0) return true;
            return (
              matchFilter.some((team) => team.id === match.team1_id) ||
              matchFilter.some((team) => team.id === match.team2_id)
            );
          })
          .map((match) => (
            <div key={match.id}>
              <div
                className={
                  "grid grid-cols-3 items-center justify-between gap-2 rounded-lg p-2 text-center " +
                  getColorClass(match.group_letter)
                }
              >
                <div className="flex flex-col items-center justify-center">
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
                  <span>
                    {teams?.find((team) => team.id === match.team1_id)?.name}
                  </span>
                </div>
                <div>{getBetweenContent(match)}</div>
                <div className="flex flex-col items-center justify-center">
                  <img
                    className="mx-1 h-9 w-9 rounded-lg border-gray-500"
                    src={
                      teams?.find((team) => team.id === match.team2_id)
                        ?.image_url
                    }
                    alt={
                      teams?.find((team) => team.id === match.team2_id)?.name
                    }
                  />
                  <span>
                    {teams?.find((team) => team.id === match.team2_id)?.name}
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

      {/* Meccs létrehozása modal */}
      <CreateEditMatch
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveMatch}
        teams={teams}
      />

      {/* Meccs szerkesztése modal */}
      <CreateEditMatch
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveMatch}
        matchToEdit={currentMatch}
        teams={teams}
      />
    </div>
  );
};

export default ManageMatches;
