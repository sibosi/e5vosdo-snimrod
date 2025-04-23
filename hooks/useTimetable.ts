"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { TimetableWeek } from "@/app/api/timetable/route";

export type DayType = "Hétfő" | "Kedd" | "Szerda" | "Csütörtök" | "Péntek";

export const days: DayType[] = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek"];

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
  isConfigured: boolean | null;
}

const fetcher = async ([url, studentCode, password]: [string, string, string]) => {
  if (!studentCode || !password) {
    throw new Error("Missing credentials");
  }

  const response = await fetch(url, {
    headers: {
      "ejg-code": studentCode,
      "password": password,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch timetable: ${response.statusText}`);
  }

  return response.json();
};

export const useTimetable = ({ 
  studentCode,
  initialDay
}: UseTimetableProps = {}): UseTimetableReturn => {
  const [password, setPassword] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  
  const [selectedDay, setSelectedDay] = useState<DayType>(() => {
    if (initialDay) return initialDay;
    
    const today = new Date().getDay() - 1;
    const dayIndex = [-1, 5].includes(today) ? 0 : today;
    return days[dayIndex > 4 ? 0 : dayIndex];
  });

  useEffect(() => {
    const storedPassword = localStorage.getItem("78OM");
    setPassword(storedPassword);
    
    setIsConfigured(!!storedPassword && !!studentCode);
  }, [studentCode]);

  const shouldFetch = !!(isConfigured && studentCode && password);
  
  const { data, error } = useSWR<TimetableWeek>(
    shouldFetch ? ["/api/timetable", studentCode, password] : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 1000 * 60 * 60,
      dedupingInterval: 1000 * 60 * 5,
    }
  );

  return {
    timetable: data || null,
    isLoading: shouldFetch && !data && !error,
    isError: error || null,
    selectedDay,
    setSelectedDay,
    periodTimes,
    days,
    isConfigured
  };
};