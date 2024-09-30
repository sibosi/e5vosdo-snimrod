"use client";
import React, { useEffect } from "react";
import specialDaysJOSN from "./specialDays.json";
const specialDays: SecialDayType[] = specialDaysJOSN;

const breakTimes = [
  "8:00",
  "9:00",
  "10:00",
  "11:00",
  "12:00",
  "13:10",
  "14:20",
  "15:20",
];

export interface SecialDayEventType {
  type: string;
  date: string;
  title: string;
  description?: string;
  link?: string;
  image?: string;

  table: undefined;
}

export interface SpecialDayTableType {
  type: string;
  title: string;
  description?: string;
  link?: string;
  image?: string;
  headers: string[];
  table: Array<Array<string | null>>;

  date: undefined;
}

export interface SecialDayType {
  date: string;
  title: string;
  description?: string | null;
  link?: string;
  image?: string;
  events: Array<SecialDayEventType | SpecialDayTableType>;
}

const SecialDay = () => {
  const [today, setToday] = React.useState(new Date());
  const [todaysSpecialDay, setTodaysSpecialDay] =
    React.useState<SecialDayType>();

  useEffect(() => {
    setTodaysSpecialDay(
      specialDays.find(
        (day) =>
          day.date === today.toISOString().replaceAll("-", "/").split("T")[0],
      ),
    );
  }, [today]);

  return (
    <div className="my-4 rounded-lg bg-selfprimary-bg">
      <div className="hidden rounded-t-lg bg-selfprimary-300 py-2 text-center text-2xl font-semibold text-foreground">
        {todaysSpecialDay ? todaysSpecialDay.title : "Nincs mai esemény"}
      </div>

      <p className="hidden text-center">
        <button
          className="px-4 text-foreground"
          onClick={() => setToday(new Date(today.setDate(today.getDate() - 1)))}
        >
          {"<"}
        </button>
        <span className="text-center text-lg font-semibold text-foreground">
          {today.toISOString().replaceAll("-", "/").split("T")[0]}
        </span>
        <button
          className="px-4 text-foreground"
          onClick={() => setToday(new Date(today.setDate(today.getDate() + 1)))}
        >
          {">"}
        </button>
      </p>

      {todaysSpecialDay ? (
        <div className="p-0">
          {todaysSpecialDay.description && (
            <div className="text-center text-lg font-semibold text-foreground">
              {todaysSpecialDay.description}
            </div>
          )}
          {todaysSpecialDay.events.map((event, index) => (
            <div key={index} className="my-4 text-foreground">
              {event.type == "table" && event.table
                ? event.table.map(
                    // @ts-ignore
                    (row: string[], rowIndex: number) =>
                      today.getTime() - 0.5 * 3600000 <
                        (row[0].endsWith(".")
                          ? new Date(
                              today.toDateString() +
                                " " +
                                breakTimes[Number(row[0][0])],
                            ).getTime()
                          : new Date(
                              today.toDateString() + " " + row[0].split("-")[0],
                            ).getTime()) && (
                        <div
                          key={rowIndex}
                          className="my-4 rounded-md bg-selfprimary-20 pb-2"
                        >
                          <h3 className="mb-2 rounded-t-md bg-selfprimary-300 py-2 text-center text-lg font-bold">
                            {row[0].endsWith(".")
                              ? row[0] + " óra utáni szünet"
                              : row[0]}
                          </h3>
                          <div className="flex flex-wrap justify-center gap-4 p-2">
                            {row.slice(1).map(
                              (cell, cellIndex) =>
                                cell && (
                                  <div
                                    key={cellIndex}
                                    className="flex min-w-full rounded-md bg-selfprimary-100 text-center text-lg font-semibold text-foreground shadow-xl"
                                  >
                                    <div className="rounded-l-lg bg-selfprimary-300 p-2">
                                      {event.headers[cellIndex + 1]}
                                    </div>
                                    <div className="rounded-r-lg bg-selfprimary-100 p-2">
                                      {typeof cell == "string" &&
                                      cell.endsWith(".")
                                        ? cell + " óra utáni szünet"
                                        : (cell ?? "Semmi")}
                                    </div>
                                  </div>
                                ),
                            )}
                          </div>
                        </div>
                      ),
                  )
                : null}
              {event.type == "event" && (
                <div className="my-4 rounded-md bg-selfprimary-20 pb-2">
                  <h3 className="mb-2 rounded-t-md bg-selfprimary-300 py-2 text-center text-lg font-bold">
                    {event.title}
                  </h3>
                  <div className="flex flex-wrap justify-center gap-4 p-2">
                    {event.date && (
                      <div className="flex min-w-full rounded-md bg-selfprimary-100 text-center text-lg font-semibold text-foreground shadow-xl">
                        <div className="rounded-l-lg bg-selfprimary-300 p-2">
                          Időpont
                        </div>
                        <div className="rounded-r-lg bg-selfprimary-100 p-2">
                          {event.date}
                        </div>
                      </div>
                    )}
                    {event.description && (
                      <div className="flex min-w-full rounded-md bg-selfprimary-100 text-center text-lg font-semibold text-foreground shadow-xl">
                        <div className="rounded-l-lg bg-selfprimary-300 p-2">
                          Leírás
                        </div>
                        <div className="rounded-r-lg bg-selfprimary-100 p-2">
                          {event.description}
                        </div>
                      </div>
                    )}
                    {event.link && (
                      <a
                        href={event.link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex min-w-full rounded-md bg-selfprimary-100 text-center text-lg font-semibold text-foreground shadow-xl"
                      >
                        <div className="rounded-l-lg bg-selfprimary-300 p-2">
                          Link
                        </div>
                        <div className="rounded-r-lg bg-selfprimary-100 p-2">
                          {event.link}
                        </div>
                      </a>
                    )}
                    {event.image && (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="mx-auto my-4"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-lg font-semibold text-foreground">
          Nincs mai esemény
        </div>
      )}
    </div>
  );
};

export default SecialDay;
