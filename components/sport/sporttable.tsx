"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@nextui-org/react";

export const SportTable = () => {
  const [playerData, setPlayerData] = useState(null);

  useEffect(() => {
    // Fetch data from results.json
    fetch("/foci.json")
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
    player4Name11,
    player4Name12,
    player4Name21,
    player4Name22,
    player4Name31,
    player4Name32,
    player4Name41,
    player4Name42,

    player2Name11,
    player2Name12,
    player2Name21,
    player2Name22,

    player1Name1,
    player1Name2,

    player1Name0,
  } = playerData;

  return (
    <div className="pb-12">
      <div className="justify-center py-6 text-center text-foreground">
        <h1 className="text-3xl font-bold">Egyenes kiesés</h1>
      </div>
      <div className="grid grid-cols-1 justify-items-center">
        <div className="md:w-96">
          <div className="scoreboard grid w-auto grid-cols-4 justify-items-center">
            <div className="grid grid-cols-1">
              <Button color={player4Name11 ? "warning" : "default"}>
                {player4Name11}
              </Button>
              <Button color={player4Name12 ? "warning" : "default"}>
                {player4Name12}
              </Button>
              <Button color={player2Name11 ? "danger" : "default"}>
                {player2Name11 ? player2Name11 : "Negyedd."}
              </Button>
            </div>
            <div className="grid grid-cols-1">
              <Button color={player4Name21 ? "warning" : "default"}>
                {player4Name21}
              </Button>
              <Button color={player4Name22 ? "warning" : "default"}>
                {player4Name22}
              </Button>
              <Button color={player2Name12 ? "danger" : "default"}>
                {player2Name12 ? player2Name21 : "Negyedd."}
              </Button>
            </div>
            <div className="grid grid-cols-1">
              <Button color={player4Name31 ? "warning" : "default"}>
                {player4Name31}
              </Button>
              <Button color={player4Name32 ? "warning" : "default"}>
                {player4Name32}
              </Button>
              <Button color={player2Name21 ? "danger" : "default"}>
                {player2Name21 ? player2Name21 : "Negyedd."}
              </Button>
            </div>
            <div className="grid grid-cols-1">
              <Button color={player4Name41 ? "warning" : "default"}>
                {player4Name41}
              </Button>
              <Button color={player4Name42 ? "warning" : "default"}>
                {player4Name42}
              </Button>
              <Button color={player2Name22 ? "danger" : "default"}>
                {player2Name22 ? player2Name22 : "Negyedd."}
              </Button>
            </div>
          </div>

          <div className="scoreboard grid w-auto grid-cols-2 justify-items-center">
            <Button color={player1Name1 ? "secondary" : "default"}>
              {player1Name1 ? player1Name1 : "Elődöntő"}
            </Button>
            <Button color={player1Name2 ? "secondary" : "default"}>
              {player1Name2 ? player1Name2 : "Elődöntő"}
            </Button>
          </div>
          <div className="scoreboard grid w-auto grid-cols-1 justify-items-center">
            <Button color={player1Name0 ? "success" : "default"}>
              {player1Name0 ? player1Name0 : "Döntő"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
