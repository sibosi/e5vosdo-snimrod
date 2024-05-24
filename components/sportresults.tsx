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
      <div className="text-center justify-center py-6 text-foreground">
        <h1 className="text-3xl font-bold">Foci</h1>
      </div>
      <div className="scoreboard grid grid-cols-2 w-auto justify-items-center ">
        <div
          className="team w-40 md:w-52 h-20 text-foreground font-bold text-2xl text-center bg-red-600 rounded-lg pt-1"
          style={{ backgroundColor: team1Color }}
        >
          <span className="team-name">{team1Name}</span>
          <br />
          <span className="team-score">{team1Score}</span>
        </div>
        <div
          className="team w-40 md:w-52 h-20 text-foreground font-bold text-2xl text-center bg-cyan-500 rounded-lg pt-1"
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
