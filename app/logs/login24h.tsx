"use client";
import { useState } from "react";
import { Log } from "@/db/dbreq";
import dayjs from "dayjs";

// Szűrés az utolsó 24 óra bejelentkezéseire
const filterLogsLast24Hours = (logs: Log[]): Log[] => {
  const now = dayjs();
  return logs.filter(
    (log) =>
      log.action === "updateUser" &&
      dayjs(log.time).isAfter(now.subtract(24, "hour"))
  );
};

// Csoportosítás órák szerint, uniquePerHour opcióval
const groupLogsByHour = (logs: Log[], uniquePerHour: boolean): number[] => {
  const hours = Array(24).fill(0); // 24 órás tömb inicializálása

  if (uniquePerHour) {
    // Ha csak egyszer számoljuk felhasználónként óránként
    const uniqueLogs = logs.reduce((acc, log) => {
      const hour = dayjs(log.time).hour();
      const key = `${log.user}-${hour}`;
      if (!acc[key]) {
        acc[key] = log;
        hours[hour]++;
      }
      return acc;
    }, {} as Record<string, Log>);
  } else {
    // Minden bejelentkezést figyelembe veszünk
    logs.forEach((log) => {
      const hour = dayjs(log.time).hour();
      hours[hour]++;
    });
  }

  return hours;
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
import { Button } from "@nextui-org/react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = ({ data }: { data: number[] }) => {
  const chartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`), // Óránkénti címkék
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

export const LineChartLogin24 = ({ logs }: { logs: Log[] }) => {
  const [uniquePerHour, setUniquePerHour] = useState(false); // Állapot hozzáadása

  const filteredLogs = filterLogsLast24Hours(logs);
  const hourlyLogins = groupLogsByHour(filteredLogs, uniquePerHour);

  return (
    <div>
      <Button
        onClick={() => setUniquePerHour(!uniquePerHour)}
        className="mb-4 px-4 py-2"
        color="primary"
      >
        {uniquePerHour
          ? "Összes bejelentkezés mutatása"
          : "Felhasználónként egy bejelentkezés mutatása óránként"}
      </Button>
      <LineChart data={hourlyLogins} />
    </div>
  );
};
