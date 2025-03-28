"use client";
import { Image } from "@heroui/react";
import React, { useEffect, useState } from "react";
import "./timer.css";
import { Match, Team } from "@/db/matches";

const LiveScore = () => {
  const [isActiveHeadSpace, setIsActiveHeadSpace] = useState(false);

  useEffect(() => {
    fetch("/api/getPageSettings").then((res) =>
      res.json().then((data) => setIsActiveHeadSpace(data.headspace == "1")),
    );
  });

  if (!isActiveHeadSpace) return <></>;
  return <LiveScoreContent />;
};

const LiveScoreContent = () => {
  const [clicked, setClicked] = useState(false);
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

    // Set up SSE connection
    const eventSource = new EventSource("/api/livescore");

    eventSource.onopen = () => {
      setIsConnected(true);
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
          const matches = data.initialData;
          setAllMatches(matches);

          // Sort by date then find the first match that has pending or live status
          const sortedMatches = [...matches].sort((a, b) =>
            a.datetime.localeCompare(b.datetime),
          );

          const liveMatch = sortedMatches.find(
            (m) => m.status === "pending" || m.status === "live",
          );

          if (liveMatch) {
            setMatch(liveMatch);
          }
          return;
        }

        // Handle delta updates
        if (data.changed || data.added || data.removed) {
          // Create a new copy of the matches array
          const updatedMatches = [...allMatches];

          // Process removed matches
          if (data.removed && data.removed.length > 0) {
            // Filter out removed matches
            const removedIds = new Set(data.removed);
            const filteredMatches = updatedMatches.filter(
              (m) => !removedIds.has(m.id),
            );
            setAllMatches(filteredMatches);
          }

          // Process added matches
          if (data.added && data.added.length > 0) {
            setAllMatches([...updatedMatches, ...data.added]);
          }

          // Process changed matches
          if (data.changed && data.changed.length > 0) {
            // Update changed matches
            const matchMap = new Map(updatedMatches.map((m) => [m.id, m]));

            for (const changedMatch of data.changed) {
              matchMap.set(changedMatch.id, changedMatch);

              // Update the current match if it changed
              if (match && match.id === changedMatch.id) {
                setMatch(changedMatch);
              }
            }

            setAllMatches(Array.from(matchMap.values()));
          }

          // Find the most relevant match for display
          const sortedMatches = [...updatedMatches].sort((a, b) =>
            a.datetime.localeCompare(b.datetime),
          );

          const liveMatch = sortedMatches.find(
            (m) => m.status === "pending" || m.status === "live",
          );

          if (liveMatch && (!match || match.status === "finished")) {
            setMatch(liveMatch);
          }
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      setIsConnected(false);

      // Attempt to reconnect after a delay
      setTimeout(() => {
        eventSource.close();
        // The browser will automatically try to reconnect
      }, 5000);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  if (!teams) {
    return (
      <div className="flex h-full items-center justify-center">Loading...</div>
    );
  }

  return (
    <button
      className="mx-auto mt-1 max-w-fit rounded-full bg-selfprimary-50 px-6 text-center text-xs font-semibold text-foreground"
      onClick={() => setClicked(!clicked)}
    >
      <div className="flex items-center justify-center gap-2">
        {match ? (
          <>
            <div className="flex w-14 flex-col items-center justify-center overflow-hidden text-xs">
              {match.id != -1 && (
                <Image
                  src={teams[match.team1_id - 1].image_url}
                  width={40}
                  height={40}
                  alt={teams[match.team1_id - 1].name}
                  className="mx-auto"
                />
              )}

              <p className="max-w-[56px] text-xs">
                {teams[match.team1_id - 1].name}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <p className="text-2xl font-bold text-success-600">
                {match.status === "pending"
                  ? "vs"
                  : match.team1_score + " - " + match.team2_score}
              </p>
              {match.status === "pending" && (
                <p className="text-sm font-semibold">
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

                  <p className="text-xs font-semibold">
                    {currentTime?.toLocaleTimeString([], {
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </p>
                </div>
              )}
            </div>
            <div className="flex w-14 flex-col items-center justify-center overflow-hidden text-xs">
              {
                <Image
                  src={teams[match.team2_id - 1].image_url}
                  width={40}
                  height={40}
                  alt={teams[match.team2_id - 1].name}
                  className="mx-auto"
                />
              }

              <p className="max-w-[56px] text-xs">
                {teams[match.team2_id - 1].name}
              </p>
            </div>
          </>
        ) : (
          <p className="text-lg font-semibold">Meccs betöltése...</p>
        )}
      </div>

      <div
        className={
          "overflow-hidden rounded-b-full bg-selfprimary-50 transition-all duration-500" +
          (clicked ? " -mb-4 h-auto" : "m-0 h-0")
        }
      >
        <p>
          {match && teams[match.team1_id - 1]?.name} vs{" "}
          {match && teams[match.team2_id - 1]?.name}
        </p>
      </div>
    </button>
  );
};

export default LiveScore;
