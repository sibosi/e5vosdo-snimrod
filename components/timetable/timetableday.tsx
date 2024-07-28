"use client";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalContent,
  User,
} from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import teacherDataByName from "@/public/storage/teacherDataByNames.json";
import getUserClass from "@/public/getUserClass";
import { UserType } from "@/db/dbreq";
import { Alert } from "../home/alert";
const teacherByName = teacherDataByName as any;

interface Lesson {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
  room: string;
  EJG_classes: string[];
  group_name: number | "null";
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
  LessonOption[]
];

type TimetableDay = [LessonDay, LessonDay, LessonDay, LessonDay, LessonDay];
// A list with 5 [Lesson[], Lesson[], Lesson[], Lesson[], Lesson[]]

type DayDuration = [number, number];
type WeekDuration = [
  DayDuration,
  DayDuration,
  DayDuration,
  DayDuration,
  DayDuration
];

const countWeekDuration = (
  timetableDay: TimetableDay,
  setWeekDuration: (arg0: WeekDuration) => void
) => {
  let weekDuration = [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ] as any as WeekDuration;

  timetableDay.forEach((day, dayIndex) => {
    let dayDuration = [1, 0] as DayDuration;
    if (day[0][0]) dayDuration[0] = 0;
    day.forEach((lessonBlock, lessonBlockIndex) => {
      lessonBlock.forEach((lesson) => {
        if (lesson) {
          dayDuration[1] = lessonBlockIndex;
        }
      });
    });
    weekDuration[dayIndex] = dayDuration;
  });

  setWeekDuration(weekDuration);
};

const fetchTimetable = async (
  EJG_class: string,
  setTimetable: (arg0: Lesson[]) => void,
  setTimetableDay: (arg: TimetableDay) => void
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

  let timetableDay = [[], [], [], [], []] as any as TimetableDay;
  for (let i = 0; i < 5; i++) {
    let day: LessonDay = [[], [], [], [], [], [], [], [], []];
    timetableDay[i] = day;
  }

  lessons.forEach((lesson) => {
    timetableDay[DAYS.indexOf(lesson.day)][
      HOURS.indexOf(lesson.start_time)
    ].push(lesson);
  });

  // Add "break" if there is no lesson at that time
  timetableDay.forEach((day) => {
    day.forEach((lessonBlock) => {
      if (lessonBlock.length === 0) {
        lessonBlock.push(null);
      }
    });
  });

  setTimetable(lessons);
  setTimetableDay(timetableDay);
};

const editDefaultGroup = async (group: number) => {
  fetch("/api/editDefaultGroup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      group: group,
    }),
  });
};

const hideLessons = (
  lessons: LessonOption[],
  lessonBlockIndexes: number[],
  hiddenLessons: number[],
  setHiddenLessons: (arg: number[]) => void
) => {
  const hideLessonsList = lessons
    .map((lesson) => lesson?.id ?? -1)
    .concat(hiddenLessons.filter((item) => !lessonBlockIndexes.includes(item)));
  setHiddenLessons(hideLessonsList);
  fetch("/api/setHiddenLessons", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      lessonsId: hideLessonsList,
    }),
  });
};

const Cell = ({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => {
  return (
    <div
      className={
        "min-w-fit w-full h-14 px-4 my-1 rounded-xl grid grid-cols-1 " +
        className
      }
      onClick={onClick}
    >
      <div className="max-w-fit m-auto flex">{children}</div>
    </div>
  );
};

const TimetableDay = ({ selfUser }: { selfUser: UserType }) => {
  const [EJG_class, setEJG_class] = useState(getUserClass(selfUser));
  const [timetable, setTimetable] = useState<Lesson[]>([]);
  const [timetableDay, setTimetableDay] = useState<TimetableDay>();
  const [selectedLesson, setSelectedLesson] = useState<LessonOption>();

  const [hiddenLessons, setHiddenLessons] = useState<number[]>(
    selfUser.hidden_lessons ?? []
  );

  const [weekDuration, setWeekDuration] = useState<WeekDuration>();
  const [hide, setHide] = useState<"none" | "selected" | "edit">("selected");

  const [selectedDayKeys, setSelectedDayKeys] = React.useState<any>(
    new Set([
      [
        ["Hétfő", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Hétfő"][
          new Date().getDay()
        ],
      ] ?? "Hétfő",
    ])
  );
  const selectedDayValue = React.useMemo(
    () => Array.from(selectedDayKeys).join(", ").replaceAll("_", " "),
    [selectedDayKeys]
  );

  const dayOfWeek = React.useMemo(
    () =>
      ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek"].indexOf(
        selectedDayValue
      ),
    [selectedDayValue]
  );

  const [selectedClassGroupKeys, setSelectedClassGroupKeys] = React.useState(
    new Set(
      (
        ["Nincs csoport", "1-es csoport", "2-es csoport"][
          selfUser.default_group ?? 0
        ] ?? "Nincs csoport"
      ).split(", ")
    )
  );
  const classGroupValue = React.useMemo(
    () =>
      ["Nincs csoport", "1-es csoport", "2-es csoport"].indexOf(
        Array.from(selectedClassGroupKeys)[0]
      ),
    [selectedClassGroupKeys]
  );

  useEffect(() => {
    fetchTimetable(EJG_class, setTimetable, setTimetableDay);
  }, [EJG_class]);

  useEffect(() => {
    if (timetableDay) countWeekDuration(timetableDay, setWeekDuration);
  }, [timetableDay]);

  useEffect(() => {
    editDefaultGroup(classGroupValue);
  }, [classGroupValue]);

  return (
    <div className="text-foreground">
      <div className="flex gap-4 mb-2">
        <Input
          placeholder="Osztály"
          value={EJG_class}
          onValueChange={(value: string) => setEJG_class(value.toUpperCase())}
          color="primary"
        />
        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered" className="capitalize">
              {selectedDayValue}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Single selection example"
            variant="flat"
            disallowEmptySelection
            selectionMode="single"
            selectedKeys={selectedDayKeys}
            onSelectionChange={(keys: any) => setSelectedDayKeys(new Set(keys))}
          >
            <DropdownItem key="Hétfő">Hétfő</DropdownItem>
            <DropdownItem key="Kedd">Kedd</DropdownItem>
            <DropdownItem key="Szerda">Szerda</DropdownItem>
            <DropdownItem key="Csütörtök">Csütörtök</DropdownItem>
            <DropdownItem key="Péntek">Péntek</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div className="flex gap-4 mb-2">
        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered" className="w-full">
              {selectedClassGroupKeys}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Single selection example"
            variant="flat"
            disallowEmptySelection
            selectionMode="single"
            selectedKeys={selectedClassGroupKeys}
            onSelectionChange={(keys: any) =>
              setSelectedClassGroupKeys(new Set(keys))
            }
          >
            <DropdownItem key="Nincs csoport">Nincs csoport</DropdownItem>
            <DropdownItem key="1-es csoport">1-es csoport</DropdownItem>
            <DropdownItem key="2-es csoport">2-es csoport</DropdownItem>
          </DropdownMenu>
        </Dropdown>

        <Button
          onClick={() => {
            hide == "selected"
              ? setHide("none")
              : hide == "none"
              ? setHide("edit")
              : setHide("selected");
          }}
        >
          {hide == "selected"
            ? "Saját órák"
            : hide === "edit"
            ? "Módosítás"
            : "Összes óra"}
        </Button>
        <Button
          onClick={() => {
            hideLessons([], [], [], setHiddenLessons);
          }}
        >
          Visszaállítás
        </Button>
      </div>

      {timetableDay ? (
        <div>
          {hide === "edit" ? (
            <Alert className="text-sm">
              Itt állíthatod, mely órák ne jelenjenek meg az órarendedben. Ha
              egy sorban több órát látsz, kattints a sajátodra, hogy a többit
              elrejthessük.
            </Alert>
          ) : (
            hiddenLessons.length == 0 && (
              <Alert className="text-sm">
                A jelenlegi beállítások alapján az osztályod összes órája
                látható az órarendben. Ha szeretnél egyes órákat elrejteni,
                válaszd a &quot;Módosítás&quot; opciót.
              </Alert>
            )
          )}
          <div className="grid grid-cols-1">
            {
              <div>
                {timetableDay[dayOfWeek] ? (
                  timetableDay[dayOfWeek].map(
                    (lessonBlock, lessonBlockIndex) =>
                      weekDuration &&
                      weekDuration[dayOfWeek][0] <= lessonBlockIndex &&
                      lessonBlockIndex <= weekDuration[dayOfWeek][1] && (
                        <div
                          key={"LessonBlock" + lessonBlockIndex}
                          className="w-full flex"
                        >
                          <div className="min-w-fit h-14 px-2 my-1 rounded-xl grid grid-cols-1 bg-default max-w-[24px] w-6 mr-4 text-center">
                            <p>{lessonBlockIndex + ". óra"}</p>
                            <p className="text-sm">
                              {
                                [
                                  "07:15",
                                  "08:15",
                                  "09:15",
                                  "10:15",
                                  "11:15",
                                  "12:25",
                                  "13:35",
                                  "14:30",
                                  "15:25",
                                ][lessonBlockIndex]
                              }
                            </p>
                          </div>
                          <div
                            key={"LessonBlockInside" + lessonBlockIndex}
                            className={
                              "w-full flex gap-2 " +
                              (lessonBlock.length > 1
                                ? "inline-flex overflow-x-scroll scrollbar-hide "
                                : "")
                            }
                          >
                            {lessonBlock.map((lesson, lessonIndex) =>
                              lesson === null ? (
                                <Cell
                                  className="bg-default-100 border-default-400 border-2"
                                  key={
                                    "Block" +
                                    lessonBlockIndex +
                                    "Lesson" +
                                    lessonIndex
                                  }
                                >
                                  Szünet
                                </Cell>
                              ) : (!hiddenLessons.includes(lesson.id) ||
                                  hide != "selected") &&
                                (lessonBlock.length != 2 ||
                                  hide != "selected" ||
                                  lesson.group_name == classGroupValue ||
                                  lesson.group_name === "null" ||
                                  classGroupValue == 0) ? (
                                <Cell
                                  key={"Lesson" + lesson.id}
                                  className={
                                    hiddenLessons.includes(lesson.id)
                                      ? "bg-default-100 border-default-400 border-2"
                                      : "bg-primary-100 border-primary-400 border-2"
                                  }
                                  onClick={() =>
                                    hide == "edit"
                                      ? !hiddenLessons.includes(lesson.id)
                                        ? hideLessons(
                                            lessonBlock.filter(
                                              (item) => item !== lesson && item
                                            ),
                                            lessonBlock.map(
                                              (item) => item?.id ?? -1
                                            ),
                                            hiddenLessons,
                                            setHiddenLessons
                                          )
                                        : hideLessons(
                                            [],
                                            lessonBlock.map(
                                              (item) => item?.id ?? -1
                                            ),
                                            hiddenLessons,
                                            setHiddenLessons
                                          )
                                      : setSelectedLesson(lesson)
                                  }
                                >
                                  <User
                                    as="button"
                                    type="button"
                                    avatarProps={{
                                      isBordered: true,
                                      src: teacherByName[lesson.teacher]?.Photo,
                                    }}
                                    className="transition-transform px-2"
                                    description={lesson.room}
                                    name={lesson.teacher}
                                  />
                                  <div className="m-auto">
                                    {lesson.subject}{" "}
                                    {lesson.group_name == "null"
                                      ? ""
                                      : lesson.group_name}{" "}
                                  </div>
                                </Cell>
                              ) : null
                            )}
                          </div>
                        </div>
                      )
                  )
                ) : (
                  <p>Nincs órád ezen a napon</p>
                )}
              </div>
            }
          </div>
          <Modal
            placement="center"
            size="sm"
            isOpen={selectedLesson !== undefined}
            onClose={() => setSelectedLesson(undefined)}
            className="mx-5"
          >
            <ModalContent className="p-4 text-foreground">
              <h3 className="text-lg font-bold">Az óra részletei</h3>
              <div className="flex">
                <User
                  avatarProps={{
                    isBordered: true,
                    src: teacherByName[selectedLesson?.teacher ?? ""]?.Photo,
                    className: "w-20 h-20",
                  }}
                  className="transition-transform p-2"
                  name
                />
                <div className="my-auto">
                  <p>
                    <b>{selectedLesson?.teacher}</b>
                  </p>
                  <p>
                    <b>Tantárgy:</b> {selectedLesson?.subject}
                  </p>
                </div>
              </div>
              <div className="text-foreground-600">
                <p>
                  <b>Terem:</b> {selectedLesson?.room}
                </p>
                <p>
                  <b>Osztály:</b> {selectedLesson?.EJG_classes.join(", ")}
                </p>
                <p>
                  <b>Csoport:</b>{" "}
                  {selectedLesson?.group_name == "null"
                    ? "Nincs csoport"
                    : selectedLesson?.group_name}
                </p>
                <p>
                  <b>Kezdés:</b> {selectedLesson?.start_time}
                </p>
                <p>
                  <b>Vége:</b> {selectedLesson?.end_time}
                </p>
              </div>

              <div className="pt-2">
                <Button
                  color="primary"
                  onClick={() => {
                    setSelectedLesson(undefined);
                  }}
                >
                  Rendben
                </Button>
              </div>
            </ModalContent>
          </Modal>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default TimetableDay;
