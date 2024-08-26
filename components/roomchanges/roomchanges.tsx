"use client";
import React from "react";
import oldRoomchangesConfig from "@/public/storage/roomchanges.json";
import { useState } from "react";
import { Button } from "@nextui-org/react";

type QuickRoomchangesConfig = [
  string, // Date string
  Array<[string, [Array<[number, string, string, string]>]]>, // Array of tuples
][];

const roomchangesConfig = oldRoomchangesConfig as QuickRoomchangesConfig;

const today = new Date();
const dd = String(today.getDate()).padStart(2, "0");
const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
const yyyy = today.getFullYear();

const today_date = yyyy + "." + mm + "." + dd;

export const RoomChanges = () => {
  let todayRoomchangesConfig: any = null;

  roomchangesConfig.map((day, dayIndex) => {
    if (day[0] == today_date) {
      todayRoomchangesConfig = roomchangesConfig[dayIndex];
    }
  });

  const [selectedGroupIndex, setSelect] = useState(0);

  return (
    <div className="text-foreground">
      <div className="flex gap-2 overflow-auto py-2 scrollbar-hide">
        {todayRoomchangesConfig &&
          todayRoomchangesConfig[1].map((group: any, groupIndex: any) => (
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
      <div className="grid max-w-full grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {todayRoomchangesConfig &&
          todayRoomchangesConfig[1][selectedGroupIndex][1].map(
            (change: any, changeIndex: any) => (
              <p
                key={changeIndex}
                className="min-w-fit rounded-xl bg-default-300 px-3 py-1"
              >
                {change[0] +
                  ". óra " +
                  change[3] +
                  " | " +
                  change[1] +
                  " ➜ " +
                  change[2]}
              </p>
            ),
          )}
      </div>
    </div>
  );
};
