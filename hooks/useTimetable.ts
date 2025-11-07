"use client";

import { useState } from "react";
import useSWR from "swr";
import { TimetableWeek } from "@/app/api/timetable/route";

export type DayType = "Hétfő" | "Kedd" | "Szerda" | "Csütörtök" | "Péntek";

const days: DayType[] = [
  "Hétfő",
  "Kedd",
  "Szerda",
  "Csütörtök",
  "Péntek",
  "Hétfő",
];

export const periodTimes = {
  0: "7:15 - 8:00",
  1: "8:15 - 9:00",
  2: "9:15 - 10:00",
  3: "10:15 - 11:00",
  4: "11:15 - 12:00",
  5: "12:25 - 13:10",
  6: "13:35 - 14:20",
  7: "14:30 - 15:15",
};

interface UseTimetableProps {
  initialDay?: DayType;
}

interface UseTimetableReturn {
  timetable: TimetableWeek | null;
  isLoading: boolean;
  isError: Error | null;
  selectedDay: DayType;
  setSelectedDay: (day: DayType) => void;
  periodTimes: typeof periodTimes;
  days: typeof days;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch timetable: ${response.statusText}`);
  }

  return response.json();
};

export const useTimetable = ({
  initialDay,
}: UseTimetableProps = {}): UseTimetableReturn => {
  const [selectedDay, setSelectedDay] = useState<DayType>(() => {
    if (initialDay) return initialDay;

    // Day indexes: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const now = new Date();
    if (now.getDay() === 0 || now.getDay() === 6) return "Hétfő";
    const todayAt1515 = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      15,
      15,
      0,
      0,
    );
    const todayName = days[now.getDay() - 1];
    const tomorrowName = days[now.getDay()];
    const isItAfter1515 = todayAt1515 < now;
    if (isItAfter1515) return tomorrowName;
    return todayName;
  });

  const { data, error } = useSWR<TimetableWeek>("/api/timetable", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 1000 * 60 * 60,
    dedupingInterval: 1000 * 60 * 5,
  });

  return {
    timetable: data || null,
    isLoading: !data && !error,
    isError: error || null,
    selectedDay,
    setSelectedDay,
    periodTimes,
    days,
  };
};
