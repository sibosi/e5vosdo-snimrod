"use client";
import React, { useState, useEffect } from "react";

export const Scoreboard = () => {
  const [teamData, setteamData] = useState(null);

  useEffect(() => {
    // Fetch data from results.json
    fetch("/foci.json")
      .then((response) => response.json())
      .then((data) => {
        // Set the team data from the JSON
        setteamData(data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []); // Empty dependency array to only run once on component mount

  // If data is not yet loaded, display loading message
  if (!teamData) {
    return <div>Loading...</div>;
  }

  // Destructure team data
  const {
    team1Name,
    team2Name,
    team1Score,
    team2Score,
    team1Color,
    team2Color,
  } = teamData;

  return (
    <div className="pb-32">
      <div className="justify-center py-6 text-center text-foreground">
        <h1 className="text-3xl font-bold">Foci</h1>
      </div>
      <div className="scoreboard grid w-auto grid-cols-2 justify-items-center">
        <div
          className="team h-20 w-40 rounded-lg bg-red-600 pt-1 text-center text-2xl font-bold text-foreground md:w-52"
          style={{ backgroundColor: team1Color }}
        >
          <span className="team-name">{team1Name}</span>
          <br />
          <span className="team-score">{team1Score}</span>
        </div>
        <div
          className="team h-20 w-40 rounded-lg bg-cyan-500 pt-1 text-center text-2xl font-bold text-foreground md:w-52"
          style={{ backgroundColor: team2Color }}
        >
          <span className="team-name">{team2Name}</span>
          <br />
          <span className="team-score">{team2Score}</span>
        </div>
      </div>
    </div>
  );
};
