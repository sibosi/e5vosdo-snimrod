import { useState, useEffect } from 'react';

// Remove SWR for React Native, use fetch and state instead

export type DayType = 'Hétfő' | 'Kedd' | 'Szerda' | 'Csütörtök' | 'Péntek';

export const days: DayType[] = [
  'Hétfő',
  'Kedd',
  'Szerda',
  'Csütörtök',
  'Péntek',
];

export const periodTimes = {
  0: '7:15 - 8:00',
  1: '8:15 - 9:00',
  2: '9:15 - 10:00',
  3: '10:15 - 11:00',
  4: '11:15 - 12:00',
  5: '12:25 - 13:10',
  6: '13:35 - 14:20',
  7: '14:30 - 15:15',
};

export interface TimetableLesson {
  code: string;
  group: string;
  slot: string;
  subject_name: string;
  teacher: string;
  room: string;
  [key: string]: any;
}

export type TimetableDay = { [period: string]: TimetableLesson };
export type TimetableWeek = { [day in DayType]?: TimetableDay };

interface UseTimetableProps {
  studentCode?: string;
  password?: string;
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

/**
 * Async fetch for timetable, with password as explicit prop.
 * You must provide the password from an external secure source, e.g. SecureStore, AsyncStorage, or a prop.
 */
export const useTimetable = ({
  studentCode,
  password = '04',
  initialDay,
}: UseTimetableProps = {}): UseTimetableReturn => {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
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
      0
    );
    const today = now.getDay() - 1;
    const dayIndex = [-1, 5].includes(today) ? 0 : today;
    const dayIndexAdjusted = todayAt1515 < now ? dayIndex + 1 : dayIndex;
    return days[dayIndexAdjusted > 4 ? 0 : dayIndexAdjusted];
  });
  const [timetable, setTimetable] = useState<TimetableWeek | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<Error | null>(null);

  useEffect(() => {
    setIsConfigured(!!studentCode && !!password);
    if (!studentCode || !password) {
      setTimetable(null);
      setIsLoading(false);
      setIsError(null);
      return;
    }
    setIsLoading(true);
    setIsError(null);

    fetch('https://e5vosdo.hu/api/timetable', {
      headers: {
        'ejg-code': studentCode,
        password: password,
      },
    })
      .then((resp) => {
        if (!resp.ok)
          throw new Error(
            `Failed to fetch timetable: ${resp.status} ${JSON.stringify(resp)}`
          );
        return resp.json();
      })
      .then((data) => {
        setTimetable(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setIsError(err);
        setIsLoading(false);
      });
  }, [studentCode, password]);

  return {
    timetable,
    isLoading,
    isError,
    selectedDay,
    setSelectedDay,
    periodTimes,
    days,
    isConfigured,
  };
};
