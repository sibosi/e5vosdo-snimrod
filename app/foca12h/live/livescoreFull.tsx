"use client";
import { Image } from "@heroui/react";
import React, { useEffect, useState } from "react";
import "@/components/navbar/headspace/timer.css";
import { Match, Team } from "@/db/matches";
import { getColorClass } from "@/app/admin/matches/manageTeams";

const LiveScore = () => {
  const [match, setMatch] = React.useState<Match>();
  const [currentTime, setCurrentTime] = useState<Date>();
  const [teams, setTeams] = useState<Team[]>();
  const [isConnected, setIsConnected] = useState(false);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
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
  }, []);

  useEffect(() => {
    if (!match) return;
    const interval = setInterval(() => {
      setCurrentTime(
        new Date(new Date().getTime() - new Date(match.start_time).getTime()),
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [match]);

  // Replace polling with SSE that handles deltas
  useEffect(() => {
    fetch("/api/getNextMatch", {
      method: "GET",
      headers: {
        module: "matches",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setMatch(data);
      });

    // Initial fetch to get data quickly - make sure this works
    fetch("/api/getMatches", {
      method: "GET",
      headers: {
        module: "matches",
      },
    })
      .then((res) => res.json())
      .then((data: Match[]) => {
        console.log("Initial matches data:", data);
        // Sort by date
        const sortedMatches = Array.isArray(data)
          ? data.sort((a, b) => a.datetime.localeCompare(b.datetime))
          : [];

        if (sortedMatches.length > 0) {
          setAllMatches(sortedMatches);
          const liveMatch = sortedMatches.find(
            (m) => m.status === "pending" || m.status === "live",
          );
          if (liveMatch) {
            setMatch(liveMatch);
          }
        }
      });

    // Initial fetch to get data quickly
    fetch("/api/livescore")
      .then((res) => res.json())
      .then((data) => {
        // Sort by date then find the first match that has pending or live status
        const sortedMatches = Array.isArray(data)
          ? data.sort((a, b) => a.datetime.localeCompare(b.datetime))
          : [];

        if (sortedMatches.length > 0) {
          setAllMatches(sortedMatches);
          const liveMatch = sortedMatches.find(
            (m) => m.status === "pending" || m.status === "live",
          );
          if (liveMatch) {
            setMatch(liveMatch);
          }
        }
      });

    // Set up SSE connection with reconnect capability
    let eventSource: EventSource | null = null;

    const connectSSE = () => {
      if (eventSource) {
        eventSource.close();
      }

      eventSource = new EventSource("/api/livescore");

      eventSource.onopen = () => {
        setIsConnected(true);
        console.log("SSE connection established");
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
          if (data.initialData) return;

          // Handle delta updates
          if (data.changed || data.added || data.removed) {
            setAllMatches((currentMatches) => {
              let updatedMatches = [...currentMatches];

              if (data.removed && data.removed.length > 0) {
                const removedIds = new Set(data.removed);
                updatedMatches = updatedMatches.filter(
                  (m) => !removedIds.has(m.id),
                );
              }

              if (data.added && data.added.length > 0) {
                updatedMatches = [...updatedMatches, ...data.added];
              }

              if (data.changed && data.changed.length > 0) {
                const matchMap = new Map(updatedMatches.map((m) => [m.id, m]));

                for (const changedMatch of data.changed) {
                  matchMap.set(changedMatch.id, changedMatch);

                  if (match && match.id === changedMatch.id) {
                    setMatch(changedMatch);
                  }
                }

                updatedMatches = Array.from(matchMap.values());
              }

              const sortedMatches = [...updatedMatches].sort((a, b) =>
                a.datetime.localeCompare(b.datetime),
              );

              const liveMatch = sortedMatches.find(
                (m) => m.status === "pending" || m.status === "live",
              );

              if (liveMatch && (!match || match.status === "finished")) {
                setMatch(liveMatch);
              }

              return updatedMatches;
            });
          }
        } catch (error) {
          console.error("Error parsing SSE data:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE Error:", error);
        setIsConnected(false);

        // Close the current connection
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }

        // Attempt to reconnect after a delay
        setTimeout(() => {
          console.log("Attempting to reconnect SSE...");
          connectSSE();
        }, 5000);
      };
    };

    // Initial connection
    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  if (!match || !teams) return <p>Betöltés folyamatban...</p>;

  return (
    <div className="space-y-4">
      <LiveScoreContent match={match} teams={teams} currentTime={currentTime} />

      <UpcomingMatches matches={allMatches} teams={teams} />
    </div>
  );
};

const LiveScoreContent = ({
  match,
  teams,
  currentTime,
}: {
  match: Match;
  teams: Team[];
  currentTime: Date | undefined;
}) => {
  if (!teams) {
    return (
      <div className="flex h-full items-center justify-center">Loading...</div>
    );
  }

  const ImageSize = 320;

  return (
    <div className="mx-auto mt-1 w-full rounded-3xl bg-selfprimary-50 px-6 py-8 text-center text-3xl font-semibold text-foreground">
      <div className="grid grid-cols-3 gap-2">
        {match ? (
          <>
            <div
              className={`flex w-[${ImageSize}] min-w-fit flex-col items-center justify-center overflow-hidden text-3xl`}
            >
              {match.id != -1 && (
                <Image
                  src={teams[match.team1_id - 1].image_url}
                  width={ImageSize}
                  height={ImageSize}
                  alt={teams[match.team1_id - 1].name}
                  className="mx-auto min-w-fit"
                />
              )}

              <p className={`max-w-[${ImageSize}] py-2 text-6xl font-bold`}>
                {teams[match.team1_id - 1].name}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center">
              {match.status !== "pending" && (getMatchStage(match))}
              <p className="text-8xl font-bold text-success-600">
                {match.status === "pending"
                  ? "vs"
                  : match.team1_score + " - " + match.team2_score}
              </p>
              {match.status === "pending" && (
                <p className="text-3xl font-semibold">
                  {new Date(match.datetime).toLocaleTimeString(["hu"], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
              {match.status === "live" && (
                <div className="w-full">
                  <div className="h-1 w-full overflow-hidden">
                    <div className="animate-grow-line-x h-full bg-green-500"></div>
                  </div>

                  <p className="text-3xl font-semibold">
                    {currentTime?.toLocaleTimeString([], {
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </p>
                </div>
              )}
            </div>
            <div
              className={`flex w-[${ImageSize}] min-w-fit flex-col items-center justify-center overflow-hidden text-3xl`}
            >
              {
                <Image
                  src={teams[match.team2_id - 1].image_url}
                  width={ImageSize}
                  height={ImageSize}
                  alt={teams[match.team2_id - 1].name}
                  className="mx-auto"
                />
              }

              <p className={`max-w-[${ImageSize}] py-2 text-6xl font-bold`}>
                {teams[match.team2_id - 1].name}
              </p>
            </div>
          </>
        ) : (
          <p className="text-lg font-semibold">Meccs betöltése...</p>
        )}
      </div>

      <div className="m-0 h-0 overflow-hidden rounded-b-full bg-selfprimary-50 transition-all duration-500">
        <p>
          {match && teams[match.team1_id - 1]?.name} vs{" "}
          {match && teams[match.team2_id - 1]?.name}
        </p>
      </div>
    </div>
  );
};

export const getMatchStage = (match: Match, size?: string) => { 
  switch (match.group_letter) {
    case "Q":
      return <p className={`text-${size ?? "5xl"} ${!size && "mb-6"} font-bold`}>
        Negyeddöntő
      </p>;
    case "H":
      return <p className={`text-${size ?? "5xl"} ${!size && "mb-6"} font-bold`}>
        Elődöntő
      </p>;
    case "W":
      return <p className={`text-${size ?? "5xl"} ${!size && "mb-6"} font-bold`}>
        Döntő
      </p>;
    default:
      return <></>;
  }}

const UpcomingMatches = ({
  matches,
  teams,
}: {
  matches: Match[];
  teams: Team[];
}) => {
  // Filter to show only upcoming and live matches, sorted by datetime
  const upcomingMatches = matches
    .filter((match) => match.status === "pending")
    .sort(
      (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
    );

  if (upcomingMatches.length === 0) {
    return (
      <div className="mt-8 text-center">
        <p className="text-lg font-semibold text-gray-500">
          Nincs további közelgő meccs
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 flex w-full flex-col items-center justify-center space-y-4">
      {upcomingMatches.map((match) => (
        <div key={match.id} className="w-full">
          <div
            className={
              "grid grid-cols-3 items-center justify-between gap-2 rounded-lg p-2 text-center text-lg font-semibold " +
              getColorClass(match.group_letter)
            }
          >
            <div className="flex flex-col items-center justify-center">
              <img
                className="mx-1 h-20 w-20 rounded-lg border-gray-500"
                src={
                  teams?.find((team) => team.id === match.team1_id)?.image_url
                }
                alt={teams?.find((team) => team.id === match.team1_id)?.name}
              />
              <span>
                {teams?.find((team) => team.id === match.team1_id)?.name}
              </span>
            </div>
            <div>
              <div className="">
                {getMatchStage(match)}
                <p className="text-3xl font-bold">vs</p>
                <p className="text-2xl">
                  {new Date(match.datetime).toLocaleTimeString("hu-HU", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <img
                className="mx-1 h-20 w-20 rounded-lg border-gray-500"
                src={
                  teams?.find((team) => team.id === match.team2_id)?.image_url
                }
                alt={teams?.find((team) => team.id === match.team2_id)?.name}
              />
              <span>
                {teams?.find((team) => team.id === match.team2_id)?.name}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LiveScore;
