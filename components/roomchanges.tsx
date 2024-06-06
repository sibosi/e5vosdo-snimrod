"use client";
import React from "react";
import roomchangesConfig from "@/config/roomchanges";
import { useEffect, useState } from "react";
import { Button } from "@nextui-org/react";

export const RoomChanges = () => {
  console.log(roomchangesConfig);
  const [selectedGroupIndex, setSelect] = useState(0);
  return (
    <div className="text-foreground">
      <div className="flex gap-2 py-2 overflow-auto scrollbar-hide">
        {roomchangesConfig[0][1].map((group, groupIndex) => (
          <Button
            key={groupIndex}
            size="sm"
            onClick={() => setSelect(groupIndex)}
            className={`text-md rounded-xl ${
              selectedGroupIndex == groupIndex
                ? "bg-primary-400"
                : "bg-primary-200"
            } `}
          >
            {group[0]}
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        {roomchangesConfig[0][1][selectedGroupIndex][1].map(
          (change, changeIndex) => (
            <div
              key={changeIndex}
              className="px-3 py-1 bg-default-300 rounded-xl"
            >
              {change[0] +
                ". óra " +
                change[3] +
                " | " +
                change[1] +
                " -> " +
                change[2]}
            </div>
          )
        )}
      </div>
    </div>
  );
};
