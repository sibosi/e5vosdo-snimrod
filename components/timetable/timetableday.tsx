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
        "my-1 grid h-14 w-full min-w-fit grid-cols-1 rounded-xl px-4 " +
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

    getDefaultGroup();
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
              value={EJG_class}
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
          {hide === "edit" ? (
            <Alert className="text-sm">
              Itt állíthatod, mely órák ne jelenjenek meg az órarendedben. Ha
              egy sorban több órát látsz, kattints a sajátodra, hogy a többit
              elrejthessük.
            </Alert>
          ) : (
            hiddenLessons.length == 0 && (
              <Alert className="border-selfsecondary-300 bg-selfsecondary-100 text-sm text-foreground">
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
                          className="flex w-full"
                        >
                          <div className="my-1 mr-4 grid h-14 w-[70px] grid-cols-1 rounded-xl bg-default-200 text-center shadow-sm">
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
                                    hiddenLessons.includes(lesson.id)
                                      ? "border-2 border-default-400 bg-default-100"
                                      : "border-2 border-selfprimary-400 bg-selfprimary-100"
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
                                  <User
                                    as="button"
                                    type="button"
                                    avatarProps={{
                                      isBordered: true,
                                      src: teacherByName[lesson.teacher]?.Photo,
                                    }}
                                    className="w-52 justify-start px-2 transition-transform"
                                    description={
                                      <p className="text-foreground">
                                        {toShortRoom(lesson.room)}
                                      </p>
                                    }
                                    name={
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
            <ModalContent className="p-4 text-foreground">
              <h3 className="text-lg font-bold">Az óra részletei</h3>
              <div className="flex">
                <User
                  avatarProps={{
                    isBordered: true,
                    src: teacherByName[selectedLesson?.teacher ?? ""]?.Photo,
                    className: "w-20 h-20",
                  }}
                  className="p-2 transition-transform"
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
                  className="fill-selfprimary"
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
        <p>Az órarend betöltése...</p>
      )}
    </div>
  );
};

export default TimetableDay;
