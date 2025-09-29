"use client";
import React, { useState, useEffect } from "react";
import { useEvents } from "@/hooks/useEvents";
import { useTimetable } from "@/hooks/useTimetable";
import { Chip } from "@heroui/react";
import Link from "next/link";
import { UserType } from "@/db/dbreq";
import { TimetableLesson } from "@/app/api/timetable/route";

const HeadContent = ({ selfUser }: { selfUser: UserType | undefined }) => {
  const {
    nextEvent,
    isLoading: eventLoading,
    isError: eventError,
  } = useEvents();

  const {
    timetable,
    isLoading: timetableLoading,
    isError: timetableError,
    periodTimes,
  } = useTimetable();

  type ExtendedLessonType = TimetableLesson & {
    period: number;
    nextDay?: string;
  };

  const findNextLesson = (): ExtendedLessonType | null => {
    if (!timetable) return null;

    const now = new Date();
    const currentDay = now.getDay() - 1;

    if (currentDay < 0 || currentDay > 4) return null;

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDayName = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek"][
      currentDay
    ];

    const dayLessons = timetable[currentDayName as keyof typeof timetable];
    if (!dayLessons) return null;

    for (const entry of Object.entries(dayLessons)) {
      const period = Number(entry[0]);
      const lesson: TimetableLesson = entry[1];

      if (lesson.code === "-") continue;

      const [startHour, startMinute] = periodTimes[
        period as keyof typeof periodTimes
      ]
        .split(" - ")[0]
        .split(":")
        .map(Number);

      if (
        startHour > currentHour ||
        (startHour === currentHour && startMinute > currentMinute)
      ) {
        return { ...lesson, period: Number(period) };
      }
    }

    for (let dayOffset = 1; dayOffset <= 5; dayOffset++) {
      const nextDayIndex = (currentDay + dayOffset) % 5;
      const nextDayName = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek"][
        nextDayIndex
      ];
      const nextDayLessons = timetable[nextDayName as keyof typeof timetable];

      if (!nextDayLessons) continue;

      for (const [period, lesson] of Object.entries(nextDayLessons)) {
        if (lesson.code === "-") continue;
        return { ...lesson, period: Number(period), nextDay: nextDayName };
      }
    }

    return null;
  };

  const nextLesson = findNextLesson();

  if (eventError) return <p>Hiba történt az események betöltésekor.</p>;
  if (eventLoading) return <p>Betöltés...</p>;

  return (
    <div className="grid max-w-xl grid-cols-2 gap-2">
      {nextEvent ? (
        <div className="space-y-2 rounded-xl bg-selfprimary-50 p-2">
          <div className="info flex items-center justify-between text-sm font-semibold">
            <span className="text-sm text-selfprimary-600">
              {new Date(nextEvent.time).toLocaleDateString("hu-HU", {
                month: "short",
                day: "numeric",
              })}
            </span>

            {nextEvent.show_time && (
              <Chip size="sm" className="bg-selfsecondary-50">
                {new Date(nextEvent.time).toLocaleTimeString("hu-HU", {
                  hour: "numeric",
                  minute: "numeric",
                })}
              </Chip>
            )}
          </div>
          <h2 className="text-xl font-bold">
            {typeof nextEvent.title === "object"
              ? nextEvent.title.join(" ")
              : nextEvent.title}
          </h2>
        </div>
      ) : (
        <div className="space-y-2 rounded-xl bg-selfprimary-50 p-2">
          <p className="text-lg font-semibold">Nincs közelgő esemény</p>
        </div>
      )}

      <div className="space-y-2 rounded-xl bg-selfprimary-50 p-2">
        {(() => {
          if (timetableLoading)
            return <p className="text-sm">Órarend betöltése...</p>;
          if (timetableError)
            return (
              <p className="text-sm text-red-500">
                Hiba az órarend betöltésekor.
              </p>
            );
          if (!selfUser?.EJG_code || !selfUser?.OM5)
            return (
              <Link href="/me" className="block">
                <p className="text-sm font-medium text-selfprimary-700">
                  Hiányos adatok
                </p>
                <p className="text-xs text-selfprimary-600">
                  {!selfUser?.EJG_code && !selfUser?.OM5
                    ? "EJG kód és jelszó hiányzik"
                    : !selfUser?.EJG_code
                      ? "EJG kód hiányzik"
                      : !selfUser?.OM5
                        ? "Jelszó hiányzik"
                        : "Adatok ellenőrzése szükséges"}
                </p>
              </Link>
            );
          if (nextLesson)
            return (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-selfprimary-600">
                    {nextLesson.nextDay
                      ? `${nextLesson.nextDay}i óra`
                      : "Következő óra"}
                  </span>
                  <Chip size="sm" className="bg-selfsecondary-50">
                    {
                      periodTimes[
                        nextLesson.period as keyof typeof periodTimes
                      ].split(" - ")[0]
                    }
                  </Chip>
                </div>
                <h2 className="text-lg font-bold">Digitális kultúra</h2>
                <p className="text-xs text-selfprimary-600">
                  {nextLesson.teacher}
                </p>
              </>
            );
          return <p className="text-sm font-medium">Nincs több óra a héten</p>;
        })()}
      </div>
    </div>
  );
};

export default HeadContent;
