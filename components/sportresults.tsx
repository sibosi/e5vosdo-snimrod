"use client";
import React, { useState, useEffect } from "react";

const Scoreboard = () => {
  const [playerData, setPlayerData] = useState(null);

  useEffect(() => {
    // Fetch data from results.json
    fetch(
      "https://raw.githubusercontent.com/sibosi/e5vosdo-snimrod/dev/foci.json"
    )
      .then((response) => response.json())
      .then((data) => {
        // Set the player data from the JSON
        setPlayerData(data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []); // Empty dependency array to only run once on component mount

  // If data is not yet loaded, display loading message
  if (!playerData) {
    return <div>Loading...</div>;
  }

  // Destructure player data
  const {
    player1Name,
    player2Name,
    player1Score,
    player2Score,
    player1Color,
    player2Color,
  } = playerData;

  return (
    <div className="pb-32">
      <div className="text-center justify-center py-6 text-foreground">
        <h1 className="text-3xl font-bold">Foci</h1>
      </div>
      <div className="scoreboard grid grid-cols-2 w-auto justify-items-center ">
        <div
          className="player w-52 h-20 text-foreground font-bold text-2xl text-center bg-red-600 rounded-lg pt-1"
          style={{ backgroundColor: player1Color }}
        >
          <span className="player-name">{player1Name}</span>
          <br />
          <span className="player-score">{player1Score}</span>
        </div>
        <div
          className="player w-52 h-20 text-foreground font-bold text-2xl text-center bg-cyan-500 rounded-lg pt-1"
          style={{ backgroundColor: player2Color }}
        >
          <span className="player-name">{player2Name}</span>
          <br />
          <span className="player-score">{player2Score}</span>
        </div>
      </div>
    </div>
  );
};

export default Scoreboard;
