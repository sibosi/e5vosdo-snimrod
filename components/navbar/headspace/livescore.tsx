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
  const [teams, setTeams] = useState<Team[]>([]);
  const [isConnected, setIsConnected] = useState(false);

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

  // Replace polling with SSE
  useEffect(() => {
    // Initial fetch to get data quickly
    fetch("/api/livescore")
      .then((res) => res.json() as unknown as Match[])
      .then((data) => {
        // Sort by date then find the first match that has pending or live status
        data.sort((a, b) => {
          return (
            new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
          );
        });
        const match = data.find(
          (match) => match.status === "pending" || match.status === "live",
        );
        if (match) {
          setMatch(match);
        }
      });

    // Set up SSE connection
    const eventSource = new EventSource("/api/livescore");

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: Match[] | { message: string } = JSON.parse(event.data);

        // Ignore the initial connection message

        if (
          typeof data === "object" &&
          "message" in data &&
          data.message &&
          data.message === "Match score SSE connection established"
        ) {
          return;
        }

        if ("message" in data) return;

        // If we receive an array of matches
        if (Array.isArray(data)) {
          // Sort by date then find the first match that has pending or live status
          data.sort((a, b) => {
            return (
              new Date(a.start_time).getTime() -
              new Date(b.start_time).getTime()
            );
          });
          const match = data.find(
            (match) => match.status === "pending" || match.status === "live",
          );
          if (match) {
            setMatch(match);
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
                <p className="text-sm font-semibold">{match.start_time}</p>
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
