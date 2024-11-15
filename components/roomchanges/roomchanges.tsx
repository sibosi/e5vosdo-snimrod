"use client";
import React, { useState, useEffect } from "react";
import oldRoomchangesConfig from "@/public/storage/roomchanges.json";
import { Button } from "@nextui-org/react";

type RoomChange = [number, string, string, string];
type ClassRoomChanges = {
  [key: string]: Record<string, RoomChange[]>;
  all: Record<string, RoomChange[]>;
};
export type RoomchangesConfig = Record<string, ClassRoomChanges>;

const roomchangesConfig = oldRoomchangesConfig as unknown as RoomchangesConfig;

const today = new Date();
const dd = String(today.getDate()).padStart(2, "0");
const mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
const yyyy = today.getFullYear();

const today_date = yyyy + "." + mm + "." + dd;

export const RoomChanges = ({ selfClass }: { selfClass?: string }) => {
  const [date, setDate] = useState(new Date());

  function changeDate(days: number) {
    setDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    });
  }

  function formatDate() {
    return date
      .toLocaleDateString("hu")
      .replaceAll(". ", "/")
      .replaceAll(".", "")
      .replaceAll("/", ".");
  }

  const [selectedGroup, setSelect] = useState<string | null>(selfClass ?? null);
  const [todayRoomchangesConfig, setTodayRoomchangesConfig] =
    useState<ClassRoomChanges | null>(null);

  useEffect(() => {
    setSelect(selfClass ?? null);
    if (roomchangesConfig[formatDate()])
      setTodayRoomchangesConfig(roomchangesConfig[formatDate()]);
    else setTodayRoomchangesConfig(null);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  return (
    <div className="text-foreground">
      <p className="pb-1 text-sm font-medium">
        <button onClick={() => changeDate(-1)}>{"<"}&nbsp;</button>
        {formatDate()}
        <button onClick={() => changeDate(1)}>
          &nbsp;
          {">"}
        </button>
      </p>
      {/* Osztályok neveinek megjelenítése, ha van az adott dátumhoz tartozó helyettesítés */}
      <div className="flex gap-2 overflow-auto py-2 scrollbar-hide">
        {todayRoomchangesConfig && (
          <>
            {selfClass && (
              <Button
                size="sm"
                onClick={() => setSelect(selfClass)}
                className={`text-md rounded-xl ${
                  selectedGroup === selfClass
                    ? "bg-selfprimary-400"
                    : "bg-selfprimary-200"
                } `}
              >
                Saját - {selfClass}
              </Button>
            )}
            {Object.keys(todayRoomchangesConfig).map((group, groupIndex) => (
              <Button
                key={groupIndex}
                size="sm"
                onClick={() => setSelect(group)}
                className={`text-md rounded-xl ${
                  selectedGroup === group
                    ? "bg-selfprimary-400"
                    : "bg-selfprimary-200"
                } `}
              >
                {group}
              </Button>
            ))}
          </>
        )}
      </div>

      {/* Az adott osztályhoz tartozó helyettesítések megjelenítése */}
      <div className="grid max-w-full grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {todayRoomchangesConfig &&
          selectedGroup &&
          (todayRoomchangesConfig[selectedGroup] !== undefined ? (
            todayRoomchangesConfig[selectedGroup].all.map(
              (change: RoomChange, changeIndex: number) => (
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
            )
          ) : (
            <>Nincs teremcsere adat az adott osztályhoz.</>
          ))}
      </div>

      {!todayRoomchangesConfig && (
        <p>A mai napon nincsenek teremcsere adatok.</p>
      )}
    </div>
  );
};
