"use client";
import { Button, Input } from "@nextui-org/react";
import React, { useEffect, useState } from "react";

interface Lesson {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
  room: string;
  EJG_classes: string[];
  group_name: number | null;
  teacher: string;
  subject: string;
}

type LessonOption = Lesson | null;

type LessonDay = [
  LessonOption[],
  LessonOption[],
  LessonOption[],
  LessonOption[],
  LessonOption[],
  LessonOption[],
  LessonOption[],
  LessonOption[],
  LessonOption[],
];

type TimetableWeak = [LessonDay, LessonDay, LessonDay, LessonDay, LessonDay];
// A list with 5 [Lesson[], Lesson[], Lesson[], Lesson[], Lesson[]]

const fetchTimetable = async (
  EJG_class: string,
  setTimetable: (arg0: Lesson[]) => void,
  setTimetableWeak: (arg: TimetableWeak) => void,
) => {
  const resp = await fetch("/api/getMyClassTimetable", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      EJG_class: EJG_class,
    }),
  });
  const lessons = (await resp.json()) as Lesson[];

  // Sort lessons by day [H, K, SZ, CS, P]
  const DAYS = ["H", "K", "SZ", "CS", "P"];
  const HOURS = [
    "07:15",
    "08:15",
    "09:15",
    "10:15",
    "11:15",
    "12:25",
    "13:35",
    "14:30",
    "15:25",
    "16:20",
  ];

  lessons.sort((a, b) => {
    return DAYS.indexOf(a.day) - DAYS.indexOf(b.day);
  });

  let timetableWeak = [[], [], [], [], []] as any as TimetableWeak;
  for (let i = 0; i < 5; i++) {
    let day: LessonDay = [[], [], [], [], [], [], [], [], []];
    timetableWeak[i] = day;
  }

  lessons.forEach((lesson) => {
    timetableWeak[DAYS.indexOf(lesson.day)][
      HOURS.indexOf(lesson.start_time)
    ].push(lesson);
  });

  // Add "break" if there is no lesson at that time
  timetableWeak.forEach((day) => {
    day.forEach((lessonBlock) => {
      if (lessonBlock.length === 0) {
        lessonBlock.push(null);
      }
    });
  });

  setTimetable(lessons);
  setTimetableWeak(timetableWeak);
};

const TimetableWeek = () => {
  const [EJG_class, setEJG_class] = useState("9.C");
  const [timetable, setTimetable] = useState<Lesson[]>([]);
  const [timetableWeak, setTimetableWeak] = useState<TimetableWeak>();

  useEffect(() => {
    fetchTimetable(EJG_class, setTimetable, setTimetableWeak);
  }, [EJG_class]);

  return (
    <div>
      <h3>TimetableWeak</h3>

      <Input
        placeholder="Osztály"
        value={EJG_class}
        onValueChange={setEJG_class}
        color="primary"
      />

      <Button
        onClick={() =>
          fetchTimetable(EJG_class, setTimetable, setTimetableWeak)
        }
      >
        Lekérés
      </Button>

      {timetableWeak ? (
        <div className="flex gap-5">
          <div>
            <p>időpont</p>

            {[
              "07:15",
              "08:15",
              "09:15",
              "10:15",
              "11:15",
              "12:25",
              "13:35",
              "14:30",
              "15:25",
            ].map((hour) => (
              <p key={hour}>
                <Button>{hour}</Button>
              </p>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {timetableWeak.map((day, dayIndex) => (
              <div key={"Day" + dayIndex}>
                <h4>
                  {["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek"][dayIndex]}
                </h4>
                {day.map((lessonBlock, lessonBlockIndex) => (
                  <div
                    key={"LessonBlock" + lessonBlockIndex}
                    className={
                      "w-full " +
                      (lessonBlock.length > 1
                        ? "inline-flex overflow-x-scroll scrollbar-hide"
                        : "")
                    }
                  >
                    {lessonBlock.length > 1 ? (
                      <div className="grid min-w-[40px] rounded-xl bg-warning">
                        <div className="m-auto">{lessonBlock.length}</div>
                      </div>
                    ) : (
                      <></>
                    )}
                    {lessonBlock.map((lesson, lessonIndex) =>
                      lesson === null ? (
                        <Button key={"Lesson" + lessonIndex}>Szünet</Button>
                      ) : (
                        <Button
                          key={"Lesson" + lessonIndex}
                          color="primary"
                          className="min-w-fit"
                        >
                          {lesson.subject} {lesson.group_name}
                        </Button>
                      ),
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default TimetableWeek;
