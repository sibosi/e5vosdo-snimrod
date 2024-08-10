"use client";
import { useState } from "react";
import { Log } from "@/db/dbreq";
import dayjs from "dayjs";

// Szűrés egy adott órában történt bejelentkezésekre
const filterLogsLastHour = (logs: Log[], hour: number): Log[] => {
  return logs.filter(
    (log) => log.action === "updateUser" && dayjs(log.time).hour() === hour
  );
};

// Csoportosítás percenként, uniquePerMinute opcióval
const groupLogsByMinute = (logs: Log[], uniquePerMinute: boolean): number[] => {
  const minutes = Array(60).fill(0); // 60 perces tömb inicializálása

  if (uniquePerMinute) {
    // Ha csak egyszer számoljuk felhasználónként percenként
    const uniqueLogs = logs.reduce((acc, log) => {
      const minute = dayjs(log.time).minute();
      const key = `${log.user}-${minute}`;
      if (!acc[key]) {
        acc[key] = log;
        minutes[minute]++;
      }
      return acc;
    }, {} as Record<string, Log>);
  } else {
    // Minden bejelentkezést figyelembe veszünk
    logs.forEach((log) => {
      const minute = dayjs(log.time).minute();
      minutes[minute]++;
    });
  }

  return minutes;
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
    labels: Array.from({ length: 60 }, (_, i) => `${i}. perc`), // Perces címkék
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

export const LineChartLogin1h = ({
  logs,
  hour,
}: {
  logs: Log[];
  hour: number;
}) => {
  const [uniquePerMinute, setUniquePerMinute] = useState(false); // Állapot hozzáadása

  const filteredLogs = filterLogsLastHour(logs, hour);
  const minuteLogins = groupLogsByMinute(filteredLogs, uniquePerMinute);

  return (
    <div>
      <Button
        onClick={() => setUniquePerMinute(!uniquePerMinute)}
        className="mb-4 px-4 py-2"
      >
        {uniquePerMinute
          ? "Összes bejelentkezés mutatása"
          : "Felhasználónként egy bejelentkezés mutatása percenként"}
      </Button>
      <LineChart data={minuteLogins} />
    </div>
  );
};
