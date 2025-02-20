"use client";
import { Image, Modal, ModalBody, ModalContent } from "@heroui/react";
import React, { useEffect, useState } from "react";
import "./timer.css";
import { Match } from "@/db/dbreq";

const checkImageExists = async (imageUrl: string): Promise<boolean> => {
  try {
    const response = await fetch(imageUrl, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
};

const LiveScore = () => {
  const [isActiveHeadSpace, setIsActiveHeadSpace] = useState(false);

  useEffect(() => {
    fetch("/api/getPageSettings").then((res) =>
      res.json().then((data) => setIsActiveHeadSpace(data.headspace == "1")),
    );
  });

  return <>{isActiveHeadSpace && <LiveScoreContent />}</>;
};

const LiveScoreContent = () => {
  const [clicked, setClicked] = useState(false);
  const [image1Error, setImage1Error] = useState(false);
  const [image2Error, setImage2Error] = useState(false);
  const [match, setMatch] = React.useState<Match>({
    id: -1,
    url: "",
    team1: "Csapat 1",
    team2: "Csapat 2",
    team_short1: "CSP",
    team_short2: "CST",
    score1: 0,
    score2: 0,
    image1: "",
    image2: "",
    status: "Upcoming",
    time: "00:00",
    start_time: "2024/07/14 21:00",
    end_time: "2024/07/14 22:45",
  });

  const [currentTime, setCurrentTime] = useState(
    new Date(new Date().getTime() - new Date(match.start_time).getTime()),
  );

  useEffect(() => {
    if (match.time === "auto") {
      const interval = setInterval(() => {
        setCurrentTime(
          new Date(new Date().getTime() - new Date(match.start_time).getTime()),
        );
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [match.start_time, match.time]);

  // Evry 5 second update the result
  useEffect(() => {
    setImage1Error(true);
    setImage2Error(true);
    const interval = setInterval(() => {
      fetch("/api/livescore")
        .then((res) => res.json() as unknown as Match)
        .then((data) => {
          if (JSON.stringify(data) == JSON.stringify(match)) return;
          if (data.image1 !== match.image1) {
            setImage1Error(true);
            checkImageExists(data.image1).then((exists) =>
              setImage1Error(!exists),
            );
          }
          if (data.image2 !== match.image2) {
            setImage2Error(true);
            checkImageExists(data.image2).then((exists) =>
              setImage2Error(!exists),
            );
          }
          setMatch(data);
          clearInterval(interval);
        });
    }, 5000);
    return () => {
      clearInterval(interval);
      setImage1Error(false);
    };
  }, [match]);

  return (
    <>
      <div
        className="mx-auto mt-1 max-w-fit rounded-badge bg-selfprimary-50 px-6 text-center text-xs font-semibold text-foreground"
        onClick={() => setClicked(!clicked)}
      >
        <div className="flex items-center gap-2">
          {match.id != -1 ? (
            <>
              <div className="flex w-14 flex-col items-center justify-center overflow-hidden text-xs">
                {match.id != -1 && !image1Error && (
                  <Image
                    src={match.image1}
                    width={40}
                    height={40}
                    alt={match.team1}
                    className="mx-auto"
                    onError={() => setImage1Error(true)}
                  />
                )}

                <p
                  className={
                    "max-w-[56px] " + (image1Error ? "text-xl" : "text-xs")
                  }
                >
                  {match.team_short1}
                </p>
              </div>
              <div className="flex flex-col items-center justify-center">
                <p className="text-2xl font-bold text-success-600">
                  {match.status === "Upcoming"
                    ? "vs"
                    : match.score1 + " - " + match.score2}
                </p>
                {match.status === "Upcoming" && (
                  <p className="text-sm font-semibold">{match.start_time}</p>
                )}
                {match.status === "Live" && (
                  // A moving green line between the minutes and the seconds
                  <div className="w-full">
                    <div className="h-1 w-full overflow-hidden">
                      <div className="animate-grow-line-x h-full bg-green-500"></div>
                    </div>

                    <p className="text-xs font-semibold">
                      {match.time === "auto"
                        ? // The time between the start and the current time
                          currentTime.toLocaleTimeString([], {
                            minute: "2-digit",
                            second: "2-digit",
                          })
                        : match.time}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex w-14 flex-col items-center justify-center overflow-hidden text-xs">
                {true && (
                  <Image
                    src={match.image2}
                    width={40}
                    height={40}
                    alt={match.team2}
                    className={
                      match.id != -1 && !image2Error ? "mx-auto" : "hidden"
                    }
                    onError={() => setImage2Error(true)}
                  />
                )}

                <p
                  className={
                    "max-w-[56px] " + (image2Error ? "text-xl" : "text-xs")
                  }
                >
                  {match.team_short2}
                </p>
              </div>
            </>
          ) : (
            <p className="text-lg font-semibold">Meccs betöltése...</p>
          )}
        </div>

        <div
          className={
            "overflow-hidden rounded-b-badge bg-selfprimary-50 transition-all duration-500" +
            (clicked ? " -mb-4 h-auto" : "m-0 h-0")
          }
        >
          <p>
            {match.team1} - {match.team2}
          </p>
        </div>
      </div>
    </>
  );
};

export default LiveScore;
