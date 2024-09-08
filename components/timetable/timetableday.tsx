"use client";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Link,
  Modal,
  ModalContent,
  User,
} from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import teacherDataByName from "@/public/storage/teacherDataByNames.json";
import getUserClass from "@/public/getUserClass";
import { UserType } from "@/db/dbreq";
import { Alert } from "../home/alert";
import { TeacherChange } from "@/app/api/route";
const teacherByName = teacherDataByName as any;
import TeachersName from "@/public/storage/teachersName.json";
const teachersName = TeachersName as { [key: string]: string };
import oldRoomchangesConfig from "@/public/storage/roomchanges.json";
import { RoomchangesConfig } from "../roomchanges/roomchanges";
const roomchangesConfig = oldRoomchangesConfig as unknown as RoomchangesConfig;

const today = new Date();
const dd = String(today.getDate()).padStart(2, "0");
const mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
const yyyy = today.getFullYear();

const today_date = yyyy + "." + mm + "." + dd;

const START_TIMES = [
  "07:15",
  "08:15",
  "09:15",
  "10:15",
  "11:15",
  "12:25",
  "13:35",
  "14:30",
  "15:25",
];

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
  LessonOption[],
];

type TimetableDay = [LessonDay, LessonDay, LessonDay, LessonDay, LessonDay];
// A list with 5 [Lesson[], Lesson[], Lesson[], Lesson[], Lesson[]]

type DayDuration = [number, number];
type WeekDuration = [
  DayDuration,
  DayDuration,
  DayDuration,
  DayDuration,
  DayDuration,
];

interface LocalChanges {
  [key: number]: {
    teacher?: string;
    room?: string;
    comment?: string;
  };
}

const countWeekDuration = (
  timetableDay: TimetableDay,
  setWeekDuration: (arg0: WeekDuration) => void,
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
  setTimetableDay: (arg: TimetableDay) => void,
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
  const HOURS = START_TIMES;

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

const toShortRoom = (room: string) => {
  // Földrajz szaktanterem földszint 10.
  const roomNumberDot = room.split(" ")[room.split(" ").length - 1];
  const roomNumber = roomNumberDot.split(".")[0];

  // Informatika 4. labor földszint 1.
  if (room.includes("labor")) {
    return room.replace(" labor", "").replace("Informatika ", "Infó labor ");
  }

  // if roomNumber is a number
  if (!isNaN(parseInt(roomNumber))) {
    return roomNumberDot[roomNumberDot.length - 1] === "."
      ? roomNumber + ". terem"
      : roomNumber;
  } else {
    return room;
  }
};

const hideLessons = (
  lessons: LessonOption[],
  lessonBlockIndexes: number[],
  hiddenLessons: number[],
  setHiddenLessons: (arg: number[]) => void,
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

const FilterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    className="bi bi-sliders"
    viewBox="0 0 16 16"
  >
    <path
      fillRule="evenodd"
      d="M11.5 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M9.05 3a2.5 2.5 0 0 1 4.9 0H16v1h-2.05a2.5 2.5 0 0 1-4.9 0H0V3zM4.5 7a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M2.05 8a2.5 2.5 0 0 1 4.9 0H16v1H6.95a2.5 2.5 0 0 1-4.9 0H0V8zm9.45 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m-2.45 1a2.5 2.5 0 0 1 4.9 0H16v1h-2.05a2.5 2.5 0 0 1-4.9 0H0v-1z"
    />
  </svg>
);

function myRoomChange(EJGclass: string) {
  let possibleChanges: { [key: string]: any } = {};
  if (roomchangesConfig[today_date]) {
    if (roomchangesConfig[today_date][EJGclass.split(".")[0] + "."])
      possibleChanges[EJGclass.split(".")[0] + "."] =
        roomchangesConfig[today_date][EJGclass.split(".")[0] + "."].all;
    Object.keys(roomchangesConfig[today_date]).forEach((group) => {
      if (
        group.includes(EJGclass.split(".")[0]) &&
        group.includes(EJGclass.split(".")[1])
      ) {
        possibleChanges[group] = roomchangesConfig[today_date][group].all;
      }
    });
  }
  return possibleChanges;
}

function teacherName(name: string) {
  return teachersName[name] ?? name;
}

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
        "relative my-1 grid h-14 w-full min-w-fit grid-cols-1 rounded-xl px-3 pr-4 " +
        className
      }
      onClick={onClick}
    >
      <div className="flex max-w-fit">{children}</div>
    </div>
  );
};

const TimetableDay = ({ selfUser }: { selfUser: UserType }) => {
  const [EJG_class, setEJG_class] = useState(getUserClass(selfUser));
  const [timetableDay, setTimetableDay] = useState<TimetableDay>();
  const [selectedLesson, setSelectedLesson] = useState<LessonOption>();
  const [showSettings, setShowSettings] = useState(false);

  const [teacherChanges, setTeacherChanges] = useState<TeacherChange[]>();
  const [changesToday, setChangesToday] = useState<LocalChanges>({});

  const [hiddenLessons, setHiddenLessons] = useState<number[]>(
    selfUser.hidden_lessons ?? [],
  );

  const [weekDuration, setWeekDuration] = useState<WeekDuration>();
  const [hide, setHide] = useState<"none" | "selected" | "edit">("selected");

  const [selectedDayKeys, setSelectedDayKeys] = React.useState<any>(
    new Set([
      [
        ["Hétfő", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Hétfő"][
          new Date().getDay()
        ],
      ],
    ]),
  );
  const selectedDayValue = React.useMemo(
    () => Array.from(selectedDayKeys).join(", ").replaceAll("_", " "),
    [selectedDayKeys],
  );

  const dayOfWeek = React.useMemo(
    () =>
      ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek"].indexOf(
        selectedDayValue,
      ),
    [selectedDayValue],
  );

  const [selectedClassGroupKeys, setSelectedClassGroupKeys] = React.useState(
    new Set(
      (
        ["Nincs csoport", "1-es csoport", "2-es csoport"][
          selfUser.default_group ?? 0
        ] ?? "Nincs csoport"
      ).split(", "),
    ),
  );
  const classGroupValue = React.useMemo(
    () =>
      ["Nincs csoport", "1-es csoport", "2-es csoport"].indexOf(
        Array.from(selectedClassGroupKeys)[0],
      ),
    [selectedClassGroupKeys],
  );

  useEffect(() => {
    const getDefaultGroup = async () => {
      const resp = await fetch("/api/getDefaultGroup", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await resp.json();
      const group = data as 0 | 1 | 2 | undefined;
      setSelectedClassGroupKeys(
        new Set(
          ["Nincs csoport", "1-es csoport", "2-es csoport"][group ?? 0].split(
            ", ",
          ),
        ),
      );
    };

    const getTeacherChanges = async () => {
      const data = await fetch("api").then((res) => res.json());
      setTeacherChanges(data as TeacherChange[]);
    };

    getDefaultGroup();
    getTeacherChanges();
  }, []);

  useEffect(() => {
    EJG_class && fetchTimetable(EJG_class, setTimetableDay);
  }, [EJG_class]);

  useEffect(() => {
    if (timetableDay) countWeekDuration(timetableDay, setWeekDuration);
  }, [timetableDay]);

  useEffect(() => {
    showSettings ? editDefaultGroup(classGroupValue) : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classGroupValue]);

  function checkIfMultipleLessonsInTime(lessonBlock: LessonOption[]) {
    let count = 0;
    lessonBlock.forEach((lesson) => {
      if (
        lesson &&
        !hiddenLessons.includes(lesson.id) &&
        (lessonBlock.length != 2 ||
          hide != "selected" ||
          lesson.group_name == classGroupValue ||
          lesson.group_name === "null" ||
          classGroupValue == 0)
      ) {
        count++;
      }
    });
    return count > 1;
  }

  useEffect(() => {
    function checkIfChangeToday() {
      let changes: LocalChanges = {};

      if (!timetableDay) {
        return changes;
      }

      for (const lessonBlock of timetableDay[dayOfWeek]) {
        for (const lesson of lessonBlock) {
          if (lesson && teacherChanges) {
            for (const teacherChange of teacherChanges) {
              for (const change of teacherChange.changes) {
                if (
                  change.missingTeacher.toLowerCase() ===
                    lesson.teacher.toLowerCase() &&
                  change.day === selectedDayValue &&
                  START_TIMES[Number(change.hour)] === lesson.start_time
                ) {
                  console.log('"' + change.replacementTeacher + '"');
                  changes[lesson.id] = {
                    // If the last character is &nbsp; or  " " remove it
                    teacher: change.replacementTeacher.replace(/ /g, ""),
                    comment: change.comment,
                  };
                }
              }
            }
          }
          if (lesson && roomchangesConfig[today_date][lesson.EJG_classes[0]]) {
            if (
              roomchangesConfig[today_date][lesson.EJG_classes[0]][
                START_TIMES.indexOf(lesson.start_time)
              ]
            ) {
              console.log(roomchangesConfig[today_date][lesson.EJG_classes[0]]);
              roomchangesConfig[today_date][lesson.EJG_classes[0]][
                START_TIMES.indexOf(lesson.start_time)
              ].forEach((change) => {
                if (
                  change[1] === toShortRoom(lesson.room).replace(". terem", "")
                ) {
                  changes[lesson.id] = {
                    ...changes[lesson.id],
                    room: String(change[2]),
                  };
                }
                console.log(change);
                console.log(toShortRoom(lesson.room).replace(". terem", ""));
                console.log(lesson);
                console.log(changes);
              });
            }
          }
        }
      }

      return changes;
    }

    setChangesToday(checkIfChangeToday());
  }, [timetableDay, teacherChanges, dayOfWeek, selectedDayValue]);

  return (
    <div className="text-foreground transition-all duration-300">
      {EJG_class !== null ? (
        <>
          <div className="mb-2 flex gap-4">
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
                className="text-foreground-600"
                selectedKeys={selectedDayKeys}
                onSelectionChange={(keys: any) =>
                  setSelectedDayKeys(new Set(keys))
                }
              >
                <DropdownItem key="Hétfő">Hétfő</DropdownItem>
                <DropdownItem key="Kedd">Kedd</DropdownItem>
                <DropdownItem key="Szerda">Szerda</DropdownItem>
                <DropdownItem key="Csütörtök">Csütörtök</DropdownItem>
                <DropdownItem key="Péntek">Péntek</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Input
              className="mx-auto max-w-[120px]"
              classNames={{
                input: [
                  "bg-transparent",
                  "text-xl",
                  "text-center",
                  "font-bold",
                ],
                innerWrapper: "bg-transparent",
                inputWrapper: ["bg-transparent", "hover:bg-transparent"],
              }}
              placeholder="Osztály"
              // variant="underlined"
              value={EJG_class ?? ""}
              onValueChange={(value: string) =>
                setEJG_class(value.toUpperCase().substring(0, 5))
              }
              color="default"
            />

            <Button
              className={showSettings ? "bg-selfsecondary-400" : "bg-default"}
              onClick={() => setShowSettings(!showSettings)}
            >
              <FilterIcon />
            </Button>
          </div>
          <div
            className={`mb-2 flex h-auto gap-4 overflow-hidden transition-all duration-1000 ease-in-out ${
              showSettings ? "h-auto p-2 pl-4" : "max-h-0 p-0"
            }`}
          >
            <Dropdown>
              <DropdownTrigger>
                <Button variant="bordered" className="w-full">
                  {selectedClassGroupKeys}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Single selection example"
                variant="flat"
                className="text-foreground-600"
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
        </>
      ) : EJG_class === null ? (
        <Cell className="bg-warning-400 text-black">
          <p>
            Kérlek add meg az osztályodat{" "}
            <Link href="/me" className="font-bold">
              a profilodban
            </Link>
            , hogy megjeleníthessük az órarendedet.
          </p>
        </Cell>
      ) : (
        <p>Osztály betöltése...</p>
      )}

      {timetableDay ? (
        <div>
          {hiddenLessons.length == 0 && hide !== "edit" && (
            <Alert className="max-h-screen w-full border-selfsecondary-300 bg-selfsecondary-100 text-sm text-foreground transition-all duration-300">
              A jelenlegi beállítások alapján az osztályod összes órája látható
              az órarendben. Ha szeretnél egyes órákat elrejteni, válaszd a
              &quot;Módosítás&quot; opciót.
            </Alert>
          )}
          {hide === "edit" ? (
            <Alert className="border-success-300 bg-success-100 text-sm">
              Itt állíthatod, mely órák ne jelenjenek meg az órarendedben. Ha{" "}
              <span className="rounded-lg bg-secondary-100">
                egy sorban több órát
              </span>{" "}
              látsz, kattints a sajátodra, hogy a többit elrejthessük.
            </Alert>
          ) : (
            <></>
          )}
          {Object.keys(changesToday).length > 0 && (
            <Alert className="border-danger-300 bg-danger-100 text-sm text-foreground">
              Az órarendedben változás található! (helyettesítés)
            </Alert>
          )}
          {EJG_class && Object.keys(myRoomChange(EJG_class)).length > 0 && (
            <>
              <Alert className="border-danger-300 bg-danger-100 text-sm text-foreground">
                Az órarendedben teremcsere lehet! (teremcsere)
              </Alert>
              <div className="my-3 grid grid-cols-1 gap-2">
                {Object.entries(myRoomChange(EJG_class)).map(
                  ([group, changes], groupIndex) => (
                    <div key={groupIndex}>
                      <h3 className="text-lg font-bold">{group}</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {changes.map((change: any, changeIndex: number) => (
                          <p
                            key={changeIndex}
                            className="min-w-fit rounded-xl bg-default-300 px-3 py-1"
                          >
                            {change[0] +
                              ". óra " +
                              change[3] +
                              " | " +
                              change[1] +
                              " ➜ " +
                              change[2]}
                          </p>
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </>
          )}

          <div className="grid grid-cols-1">
            {
              <div>
                {timetableDay && timetableDay[dayOfWeek] ? (
                  timetableDay[dayOfWeek].map(
                    (lessonBlock, lessonBlockIndex) =>
                      weekDuration &&
                      weekDuration[dayOfWeek][0] <= lessonBlockIndex &&
                      lessonBlockIndex <= weekDuration[dayOfWeek][1] && (
                        <div
                          key={"LessonBlock" + lessonBlockIndex}
                          className="flex w-full"
                        >
                          <div className="my-1 mr-4 grid h-14 w-[70px] grid-cols-1 rounded-xl bg-default-200 text-center shadow-sm">
                            <p>{lessonBlockIndex + ". óra"}</p>
                            <p className="text-sm">
                              {START_TIMES[lessonBlockIndex]}
                            </p>
                          </div>
                          <div
                            key={"LessonBlockInside" + lessonBlockIndex}
                            className={
                              "flex w-full gap-2 " +
                              (lessonBlock.length > 1
                                ? "inline-flex overflow-x-scroll scrollbar-hide"
                                : "")
                            }
                          >
                            {lessonBlock.map((lesson, lessonIndex) =>
                              lesson === null ? (
                                <Cell
                                  className="border-2 border-default-400 bg-default-100"
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
                                    "border-2 " +
                                    (hiddenLessons.includes(lesson.id)
                                      ? "border-default-400 bg-default-100"
                                      : Object.keys(changesToday).includes(
                                            String(lesson.id),
                                          )
                                        ? "border-danger-400 bg-danger-100"
                                        : checkIfMultipleLessonsInTime(
                                              lessonBlock,
                                            )
                                          ? "border-selfsecondary-400 bg-selfsecondary-100"
                                          : "border-selfprimary-400 bg-selfprimary-100") +
                                    (Object.keys(changesToday).includes(
                                      String(lesson.id),
                                    )
                                      ? " mr-2"
                                      : "")
                                  }
                                  onClick={() =>
                                    hide == "edit"
                                      ? !hiddenLessons.includes(lesson.id)
                                        ? hideLessons(
                                            lessonBlock.filter(
                                              (item) => item !== lesson && item,
                                            ),
                                            lessonBlock.map(
                                              (item) => item?.id ?? -1,
                                            ),
                                            hiddenLessons,
                                            setHiddenLessons,
                                          )
                                        : hideLessons(
                                            [],
                                            lessonBlock.map(
                                              (item) => item?.id ?? -1,
                                            ),
                                            hiddenLessons,
                                            setHiddenLessons,
                                          )
                                      : setSelectedLesson(lesson)
                                  }
                                >
                                  {Object.keys(changesToday).includes(
                                    lesson.id.toString(),
                                  ) && (
                                    <div className="absolute right-0 top-0 -mx-2 -my-1 rounded-badge border-2 border-selfsecondary-400 bg-selfsecondary-200 px-2 text-xs">
                                      változás
                                    </div>
                                  )}
                                  <User
                                    as="button"
                                    type="button"
                                    avatarProps={{
                                      isBordered: true,
                                      src: teacherByName[
                                        teacherName(
                                          changesToday[lesson.id]?.teacher ??
                                            lesson.teacher,
                                        )
                                      ]?.Photo,
                                    }}
                                    className="w-52 justify-start px-2 transition-transform"
                                    description={
                                      changesToday[lesson.id]?.room ? (
                                        <p className="font-bold text-foreground">
                                          {toShortRoom(
                                            changesToday[lesson.id]
                                              ?.room as string,
                                          )}
                                        </p>
                                      ) : (
                                        <p className="text-foreground">
                                          {toShortRoom(lesson.room)}
                                        </p>
                                      )
                                    }
                                    name={
                                      changesToday[lesson.id]?.teacher ===
                                      undefined ? (
                                        lesson.teacher != "null" ? (
                                          <span className="h-5 w-5 break-words">
                                            {lesson.teacher.substring(0, 20) +
                                              (lesson.teacher.length > 20
                                                ? "..."
                                                : "")}
                                          </span>
                                        ) : (
                                          "Tanár"
                                        )
                                      ) : (
                                        <span className="h-5 w-5 break-words font-bold">
                                          {lesson.teacher
                                            ? changesToday[
                                                lesson.id
                                              ].teacher?.substring(0, 20) +
                                              ((changesToday[lesson.id].teacher
                                                ?.length as number) > 20
                                                ? "..."
                                                : "")
                                            : "???"}
                                        </span>
                                      )
                                    }
                                  />
                                  <div className="m-auto">
                                    {lesson.subject}{" "}
                                    {lesson.group_name == "null"
                                      ? ""
                                      : lesson.group_name}{" "}
                                  </div>
                                </Cell>
                              ) : null,
                            )}
                          </div>
                        </div>
                      ),
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
            {selectedLesson && (
              <ModalContent className="p-4 text-foreground">
                <h3 className="text-lg font-bold">Az óra részletei</h3>
                <div className="flex">
                  <User
                    avatarProps={{
                      isBordered: true,
                      src: teacherByName[ // Replace new line with space
                        teacherName(selectedLesson.teacher.replace(/\n/g, " "))
                      ]?.Photo,
                      className: "w-20 h-20",
                    }}
                    className="p-2 transition-transform"
                    name
                  />
                  <div className="my-auto">
                    <p>
                      <b>
                        {selectedLesson.teacher}
                        {changesToday[selectedLesson.id]?.teacher
                          ? ` (${changesToday[selectedLesson.id].teacher})`
                          : ""}
                      </b>
                    </p>
                    <p>
                      <b>Tantárgy:</b> {selectedLesson.subject}
                    </p>
                  </div>
                </div>
                <div className="text-foreground-600">
                  <p>
                    <b>Terem:</b> {selectedLesson.room}
                    {changesToday[selectedLesson.id]?.room
                      ? ` (${changesToday[selectedLesson.id].room})`
                      : ""}
                  </p>
                  <p>
                    <b>Osztály:</b> {selectedLesson.EJG_classes.join(", ")}
                  </p>
                  <p>
                    <b>Csoport:</b>{" "}
                    {selectedLesson.group_name == "null"
                      ? "Nincs csoport"
                      : selectedLesson.group_name}
                  </p>
                  <p>
                    <b>Kezdés:</b> {selectedLesson.start_time}
                  </p>
                  <p>
                    <b>Vége:</b> {selectedLesson.end_time}
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    className="fill-selfprimary"
                    onClick={() => {
                      setSelectedLesson(undefined);
                    }}
                  >
                    Rendben
                  </Button>
                </div>
              </ModalContent>
            )}
          </Modal>
        </div>
      ) : (
        <p>Az órarend betöltése...</p>
      )}
    </div>
  );
};

export default TimetableDay;
