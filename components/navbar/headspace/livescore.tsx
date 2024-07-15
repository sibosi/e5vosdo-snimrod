"use client";
import { Image } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import "./timer.css";

interface Match {
  id: number;
  team1: string;
  team2: string;
  teamShort1: string; // 3 letter short name
  teamShort2: string; // 3 letter short name
  score1: number;
  score2: number;
  image1: string;
  image2: string;
  status: string;
  time: string;
  startTime: string;
  endTime: string;
}

const LiveScore = () => {
  const [image1Error, setImage1Error] = useState(false);
  const [image2Error, setImage2Error] = useState(false);
  const [matches, setMatches] = React.useState<Match[]>([
    {
      id: -1,
      team1: "Csapat 1",
      team2: "Csapat 2",
      teamShort1: "CSP",
      teamShort2: "CST",
      score1: 0,
      score2: 0,
      image1: "",
      image2: "",
      status: "Upcoming",
      time: "00:00",
      startTime: "2024/07/14 21:00",
      endTime: "2024/07/14 22:45",
    },
  ]);

  // Evry 5 second update the result
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/livescore")
        .then((res) => res.json())
        .then((data) => {
          setMatches([data]);
        });
    }, 5000);
    setImage1Error(false);
    setImage2Error(false);
    return () => {
      clearInterval(interval);
      setImage1Error(false);
    };
  }, []);

  return (
    <div className="max-w-fit mx-auto flex bg-success-50 rounded-badge mt-1 gap-2 px-6 text-center items-center text-xs font-semibold text-foreground">
      {matches[0].id != -1 ? (
        <>
          <div className="flex flex-col items-center justify-center text-xs overflow-hidden w-14">
            {matches[0].id != -1 && !image1Error && (
              <Image
                src={matches[0].image1}
                width={40}
                height={40}
                alt={matches[0].team1}
                className="mx-auto"
                onError={() => setImage1Error(true)}
              />
            )}

            <p
              className={
                "max-w-[56px] " + (image1Error ? "text-xl" : "text-xs")
              }
            >
              {matches[0].teamShort1}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <p className="text-2xl font-bold text-success-600">
              {matches[0].status === "Upcoming"
                ? "vs"
                : matches[0].score1 + " - " + matches[0].score2}
            </p>
            {matches[0].status === "Upcoming" && (
              <p className="text-sm font-semibold">{matches[0].startTime}</p>
            )}
            {matches[0].status === "Live" && (
              // A moving green line between the minutes and the seconds
              <div className="w-full">
                <div className="w-full h-1 overflow-hidden">
                  <div className="h-full bg-green-500 animate-grow-line-x"></div>
                </div>

                <p className="text-xs font-semibold">{matches[0].time}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center justify-center text-xs overflow-hidden w-14">
            {matches[0].id != -1 && !image2Error && (
              <Image
                src={matches[0].image2}
                width={40}
                height={40}
                alt={matches[0].team2}
                className="mx-auto"
                onError={() => setImage2Error(true)}
              />
            )}

            <p
              className={
                "max-w-[56px] " + (image2Error ? "text-xl" : "text-xs")
              }
            >
              {matches[0].teamShort2}
            </p>
          </div>
        </>
      ) : (
        <p className="text-lg font-semibold">Meccs betöltése...</p>
      )}
    </div>
  );
};

export default LiveScore;
