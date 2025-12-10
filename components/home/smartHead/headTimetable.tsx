"use client";
import { PossibleUserType } from "@/db/dbreq";
import React from "react";
import { TimetableLesson } from "@/app/api/timetable/route";
import { Alert } from "@/components/home/alert";
import Link from "next/link";
import { useTimetable } from "@/hooks/useTimetable";
import {
  TeacherChangesByDate,
  useSubstitutions,
} from "@/hooks/useSubstitutions";

function getSlot0ByDate(date: string) {
  const weekday: "h" | "k" | "s" | "c" | "p" = new Date(date)
    .toLocaleDateString("hu-HU", {
      weekday: "narrow",
    })
    .toLocaleLowerCase()[0] as any;
  return weekday;
}

function extendLessonWithSubstitutions(
  lesson: TimetableLesson,
  substitutions: TeacherChangesByDate,
): TimetableLesson {
  const allChanges = Object.values(substitutions).flatMap((changes) =>
    changes.flatMap((change) => change.changes),
  );

  const lessonChanges = allChanges.filter(
    (change) =>
      lesson.slot.startsWith(getSlot0ByDate(change.date)) &&
      lesson.slot[1] === change.period &&
      lesson.code === change.group,
  );
  if (lessonChanges.length !== 1) return lesson;
  lesson.isSubstitution = true;
  console.log(JSON.stringify(lessonChanges[0]));
  lesson.substitutionTeacher = lessonChanges[0].replacementTeacher;
  lesson.substitutionComment = lessonChanges[0].comment;
  lesson.substitutionText = "";

  lesson.substitutionText += lessonChanges[0].replacementTeacher ?? "";
  if (lessonChanges[0].comment && lessonChanges[0].comment != "-/X")
    lesson.substitutionTeacher +=
      " " + lessonChanges[0].comment.replaceAll("/X", "");

  return lesson;
}

const HeadTimetable = (props: { selfUser: PossibleUserType }) => {
  const { selfUser } = props;
  const { tableData: substitutions, isLoaded } = useSubstitutions();
  const { timetable, isLoading, isError, selectedDay, setSelectedDay, days } =
    useTimetable();

  if (!selfUser) return null;
  if (!isLoaded) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-selfprimary"></div>
      </div>
    );
  }

  if (!selfUser.EJG_code || !selfUser.OM5) {
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
    if (lesson.code === "-") return null;

    return (
      <div className="flex items-center justify-center gap-2 text-sm">
        <div className="w-2 font-semibold text-selfprimary-800">{period}.</div>

        <div className="flex w-full justify-between text-sm">
          <span className="font-semibold">
            {lesson.subject_name} &nbsp;
            {lesson.isSubstitution ? (
              <span className="text-selfsecondary-500">
                ({lesson.substitutionText})
              </span>
            ) : (
              <span className="info">({lesson.teacher})</span>
            )}
          </span>
          <span>{lesson.room}</span>
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
              ([period, lesson]: [string, TimetableLesson]) =>
                lesson.code !== "-" && (
                  <div className="flex-grow" key={period}>
                    {renderLesson(
                      extendLessonWithSubstitutions(lesson, substitutions),
                      Number.parseInt(period),
                    )}
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
