"use client";
import { UserType } from "@/db/dbreq";
import React from "react";
import { TimetableLesson } from "@/app/api/timetable/route";
import { Alert } from "@/components/home/alert";
import Link from "next/link";
import { useTimetable } from "@/hooks/useTimetable";

const HeadTimetable = (props: { selfUser: UserType }) => {
  const { selfUser } = props;
  const studentCode = selfUser.EJG_code;

  const {
    timetable,
    isLoading,
    isError,
    selectedDay,
    setSelectedDay,
    days,
    periodTimes,
    isConfigured,
  } = useTimetable({
    studentCode,
  });

  if (isConfigured === null) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-selfprimary"></div>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <Alert className="border-selfprimary-300 bg-selfprimary-50">
        <Link href="/me">
          Hiányos adatok. Kérjük, add meg a hiányzó adataidat a{" "}
          <strong className="text-selfprimary-700">
            profilodban, a Személyes adatok fülnél.
          </strong>
        </Link>
      </Alert>
    );
  }

  const renderLesson = (lesson: TimetableLesson, period: number) => {
    if (lesson.code === "-") {
      return null;
    }

    return (
      <div className="flex items-center justify-center gap-2 text-sm">
        <div className="w-12 font-semibold text-selfprimary-800">
          {periodTimes[period as keyof typeof periodTimes].split(" - ")[0]}
        </div>

        <div className="flex w-full justify-between text-sm">
          <span className="font-semibold">{lesson.subject_name}</span>
          <span>{lesson.teacher}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-md space-y-2 rounded-xl bg-selfprimary-50 p-2">
      <div className="flex justify-between">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`h-8 rounded-lg border border-selfprimary px-4 text-sm font-medium transition-colors ${
              selectedDay === day
                ? "bg-selfprimary-600 text-white"
                : "text-selfprimary-800 hover:bg-selfprimary-200"
            }`}
          >
            {day.slice(0, 2)}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex h-40 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-selfprimary"></div>
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          Hiba történt az órarend betöltése közben. Kérjük, próbáld újra később.
        </div>
      )}

      {timetable ? (
        <div className="space-y-2 rounded-lg bg-selfprimary-100 p-2">
          {timetable[selectedDay] &&
            Object.entries(timetable[selectedDay]).map(
              ([period, lesson]) =>
                lesson.code !== "-" && (
                  <div className="flex-grow" key={period}>
                    {renderLesson(lesson, parseInt(period))}
                  </div>
                ),
            )}

          {timetable[selectedDay] &&
            Object.values(timetable[selectedDay]).every(
              (lesson) => lesson.code === "-",
            ) && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-yellow-700">
                Nincs óra ezen a napon.
              </div>
            )}
        </div>
      ) : null}

      {!timetable && !isError && !isLoading && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-yellow-700">
          Nem található órarend.
        </div>
      )}
    </div>
  );
};

export default HeadTimetable;
