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

  // Evry 5 second update the result
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/livescore")
        .then((res) => res.json() as unknown as Match)
        .then((data) => {
          if (JSON.stringify(data) == JSON.stringify(match)) return;
          setMatch(data);
          clearInterval(interval);
        });
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  }, [match]);

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
