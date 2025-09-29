"use client";

import { useState } from "react";
import useSWR from "swr";
import { TimetableWeek } from "@/app/api/timetable/route";

export type DayType = "Hétfő" | "Kedd" | "Szerda" | "Csütörtök" | "Péntek";

export const days: DayType[] = [
  "Hétfő",
  "Kedd",
  "Szerda",
  "Csütörtök",
  "Péntek",
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
  studentCode?: string;
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

const fetcher = async ([url]: [string]) => {
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

    const now = new Date();
    const todayAt1515 = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      15,
      15,
      0,
      0,
    );
    const today = now.getDay() - 1;
    const dayIndex = [-1, 5].includes(today) ? 0 : today;
    const dayIndexAdjusted = todayAt1515 < now ? dayIndex + 1 : dayIndex;
    return days[dayIndexAdjusted > 4 ? 0 : dayIndexAdjusted];
  });

  const { data, error } = useSWR<TimetableWeek>(["/api/timetable"], fetcher, {
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
