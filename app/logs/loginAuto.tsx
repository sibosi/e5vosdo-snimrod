"use client";
import { useState } from "react";
import { Log } from "@/db/dbreq";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

// Szűrés a megadott időintervallumra
const filterLogsBetweenDates = (
  logs: Log[],
  start: Dayjs,
  end: Dayjs,
): Log[] => {
  return logs.filter(
    (log) =>
      log.action === "updateUser" && dayjs(log.time).isBetween(start, end),
  );
};

// Csoportosítás az időintervallum automatikus felosztásával, uniqueUser opcióval
const groupLogsByInterval = (
  logs: Log[],
  start: Dayjs,
  end: Dayjs,
  uniqueUser: boolean,
): { labels: string[]; data: number[] } => {
  const duration = end.diff(start, "minute");
  const interval = duration <= 60 ? 1 : Math.ceil(duration / 60); // Ha kevesebb mint 60 perc, akkor percenként, különben óránként

  const labels: string[] = [];
  const data: number[] = [];

  for (let i = 0; i <= duration; i += interval) {
    const current = start.add(i, "minute");
    const next = current.add(interval, "minute");

    labels.push(current.format("HH:mm"));

    let logsInInterval = logs.filter((log) =>
      dayjs(log.time).isBetween(current, next, null, "[)"),
    );

    if (uniqueUser) {
      const uniqueUsers = new Set<string>();
      logsInInterval = logsInInterval.filter((log) => {
        if (!uniqueUsers.has(log.user)) {
          uniqueUsers.add(log.user);
          return true;
        }
        return false;
      });
    }

    data.push(logsInInterval.length);
  }

  return { labels, data };
};

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Input } from "@heroui/react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const LineChart = ({ labels, data }: { labels: string[]; data: number[] }) => {
  const chartData = {
    labels, // Automatikusan generált címkék
    datasets: [
      {
        label: "Bejelentkezések száma",
        data,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
    ],
  };

  return <Line data={chartData} />;
};

// Használat valahol az appodban

export const LineChartLoginBetween = ({ logs }: { logs: Log[] }) => {
  const [startDate, setStartDate] = useState(dayjs().subtract(1, "hour")); // Kezdő időpont (pl. 1 órával korábbi időpont)
  const [endDate, setEndDate] = useState(dayjs()); // Záró időpont (aktuális időpont)
  const [uniqueUser, setUniqueUser] = useState(false); // Felhasználói egyediséget biztosító állapot

  const filteredLogs = filterLogsBetweenDates(logs, startDate, endDate);
  const { labels, data } = groupLogsByInterval(
    filteredLogs,
    startDate,
    endDate,
    uniqueUser,
  );

  return (
    <div>
      <div className="mb-4 flex">
        <Input
          type="datetime-local"
          value={startDate.format("YYYY-MM-DDTHH:mm")}
          onChange={(e) => setStartDate(dayjs(e.target.value))}
          className="mr-4 rounded-sm border p-2"
        />

        <Input
          type="datetime-local"
          value={endDate.format("YYYY-MM-DDTHH:mm")}
          onChange={(e) => setEndDate(dayjs(e.target.value))}
          className="rounded-sm border p-2"
        />
      </div>
      <button
        onClick={() => setUniqueUser(!uniqueUser)}
        className="mb-4 rounded-sm bg-blue-500 px-4 py-2 text-white"
      >
        {uniqueUser
          ? "Összes bejelentkezés mutatása"
          : "Felhasználónként egy bejelentkezés mutatása"}
      </button>
      <LineChart labels={labels} data={data} />
    </div>
  );
};
