"use client";
import React, { useEffect, useState } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  User,
  Skeleton,
  Modal,
  ModalContent,
  ModalBody,
  Switch,
  ButtonGroup,
  Button,
} from "@nextui-org/react";
import { Change, TeacherChange, teacherName } from "@/app/api/route";
import { Alert } from "../home/alert";
import Image from "next/image";
import { UserType } from "@/db/dbreq";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
};

interface TeacherChangesByDate {
  [date: string]: TeacherChange[];
}

function getTeacherChangesByDate(changesByTeacher: TeacherChange[]) {
  const changesByDate: TeacherChangesByDate = {};
  let teachersByDate: { [date: string]: string[] } = {};

  changesByTeacher.forEach((teacher) => {
    teacher.changes.forEach((change) => {
      if (!changesByDate[change.date]) {
        changesByDate[change.date] = [];
        teachersByDate[change.date] = [];
      }
      if (!teachersByDate[change.date].includes(teacher.name)) {
        changesByDate[change.date].push({
          name: teacher.name,
          photoUrl: teacher.photoUrl,
          subjects: teacher.subjects,
          changes: [],
        });
        teachersByDate[change.date].push(teacher.name);
      }

      changesByDate[change.date].forEach((teacherChange) => {
        if (teacherChange.name === teacher.name)
          teacherChange.changes.push(change);
      });
    });
  });

  const sortedKeys = Object.keys(changesByDate).sort((a, b) =>
    a.localeCompare(b),
  );
  const sortedChangesByDate: TeacherChangesByDate = {};
  sortedKeys.forEach((key) => {
    sortedChangesByDate[key] = changesByDate[key];
  });

  return sortedChangesByDate;
}

export const QuickTeachers = ({
  selfUser,
}: {
  selfUser: UserType | undefined;
}) => {
  const [devMode, setDevMode] = useState(true);

  if (selfUser?.permissions?.includes("tester"))
    return (
      <div className="flex flex-col items-center justify-center">
        <div>
          <ButtonGroup>
            <Button
              onClick={() => setDevMode(false)}
              className={
                !devMode
                  ? "bg-selfprimary-100 text-selfprimary-900"
                  : "border-1 border-selfprimary-100 bg-transparent text-selfprimary-500"
              }
            >
              Régi nézet
            </Button>
            <Button
              onClick={() => setDevMode(true)}
              className={
                devMode
                  ? "bg-selfprimary-100 text-selfprimary-900"
                  : "border-1 border-selfprimary-100 bg-transparent text-selfprimary-500"
              }
            >
              Új nézet
            </Button>
          </ButtonGroup>
        </div>
        {devMode ? <QuickTeachersDev /> : <QuickTeachersOld />}
      </div>
    );

  return <QuickTeachersOld />;
};

const QuickTeachersOld = () => {
  const [tableData, setTableData] = useState<TeacherChangesByDate>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetcher("/api/")
      .then((data: TeacherChange[]) => {
        setTableData(getTeacherChangesByDate(data));
        setIsLoaded(true);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const [selectedEvent, setSelectedEvent] = useState<Change | null>(null);

  return (
    <Skeleton
      isLoaded={isLoaded}
      className="h-auto w-auto rounded-lg text-foreground"
    >
      <React.Fragment>
        {!isLoaded && <p>Loading...</p>}
        {isLoaded && tableData && Object.keys(tableData).length ? (
          Object.keys(tableData).map((date) => (
            <div
              key={date}
              className="my-2 rounded-lg border-1 border-selfprimary-100 bg-selfprimary-bg p-2 shadow-md"
            >
              <h2 className="text-center font-bold text-foreground">
                {
                  [
                    "Vasárnap",
                    "Hétfő",
                    "Kedd",
                    "Szerda",
                    "Csütörtök",
                    "Péntek",
                    "Szombat",
                  ][new Date(date).getDay()]
                }{" "}
                ({date.slice(5, 10).replace("-", "/")})
              </h2>
              {tableData[date].map((teacher, rowIndex: number) => (
                <Dropdown key={rowIndex} className="md: block">
                  <DropdownTrigger>
                    <User
                      as="button"
                      type="button"
                      avatarProps={{
                        isBordered: true,
                        src: teacher.photoUrl,
                      }}
                      className="p-2 transition-transform"
                      description={teacher.subjects}
                      name={teacher.name}
                    />
                  </DropdownTrigger>

                  <DropdownMenu aria-label="Static Actions">
                    {teacher.changes &&
                      teacher.changes.map((event, eventIndex: number) => (
                        <DropdownItem
                          key={eventIndex}
                          className="text-foreground"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <p>
                            {"🕒 " +
                              [
                                "Vasárnap",
                                "Hétfő",
                                "Kedd",
                                "Szerda",
                                "Csütörtök",
                                "Péntek",
                                "Szombat",
                              ][new Date(event.date).getDay()] +
                              " " +
                              event.hour +
                              ". ó"}
                            &nbsp;
                            {" 📍" + // Replace &nbsp; with nothing
                              (event.room.replace(" ", "").length !== 0
                                ? event.room
                                : "???")}{" "}
                            &nbsp;
                            {"  📔" + event.subject}
                          </p>
                          <p>
                            {"   🧑🏼‍🏫 " +
                              (event.replacementTeacher.replace(" ", "")
                                .length !== 0
                                ? event.replacementTeacher
                                : "???")}{" "}
                            &nbsp;
                            {" 📝" + event.comment}
                          </p>
                        </DropdownItem>
                      ))}
                  </DropdownMenu>
                </Dropdown>
              ))}
            </div>
          ))
        ) : (
          <p>Nincs információ</p>
        )}

        {selectedEvent !== null && (
          <Modal
            isOpen={selectedEvent !== null}
            onClose={() => setSelectedEvent(null)}
          >
            <ModalContent>
              <ModalBody className="text-foreground">
                <p>
                  {"🕒 " +
                    [
                      "Vasárnap",
                      "Hétfő",
                      "Kedd",
                      "Szerda",
                      "Csütörtök",
                      "Péntek",
                      "Szombat",
                    ][new Date(selectedEvent.date).getDay()] +
                    " " +
                    selectedEvent.hour +
                    ". ó"}
                  &nbsp;
                  {" 📍" +
                    (selectedEvent.room.replace(" ", "").length !== 0
                      ? selectedEvent.room
                      : "???")}{" "}
                  &nbsp;
                  {"  📔" + selectedEvent.subject}
                </p>
                <p>{"Hiányzó tanár: " + selectedEvent.missingTeacher}</p>
                <p>
                  {"Helyettesítő tanár: " +
                    (selectedEvent.replacementTeacher.replace(" ", "")
                      .length !== 0
                      ? selectedEvent.replacementTeacher
                      : "???")}
                </p>
                <p>
                  {"Megjegyzés: " +
                    (selectedEvent.comment.replace(" ", "").length !== 0
                      ? selectedEvent.comment
                      : "Nincs")}
                </p>
              </ModalBody>
            </ModalContent>
          </Modal>
        )}
      </React.Fragment>
    </Skeleton>
  );
};

const QuickTeachersDev = () => {
  const [tableData, setTableData] = useState<TeacherChangesByDate>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetcher("/api/")
      .then((data: TeacherChange[]) => {
        setTableData(getTeacherChangesByDate(data));
        setIsLoaded(true);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const [selectedEvent, setSelectedEvent] = useState<Change | null>(null);

  return (
    <Skeleton
      isLoaded={isLoaded}
      className="h-auto w-auto rounded-lg text-foreground"
    >
      <React.Fragment>
        {!isLoaded && <p>Loading...</p>}
        {isLoaded && tableData && Object.keys(tableData).length ? (
          Object.keys(tableData).map((date) => (
            <div
              key={date}
              className="my-2 rounded-lg border-1 border-selfprimary-100 bg-selfprimary-bg p-2 shadow-md"
            >
              <h2 className="text-center font-bold text-foreground">
                {
                  [
                    "Vasárnap",
                    "Hétfő",
                    "Kedd",
                    "Szerda",
                    "Csütörtök",
                    "Péntek",
                    "Szombat",
                  ][new Date(date).getDay()]
                }{" "}
                ({date.slice(5, 10).replace("-", "/")})
              </h2>
              <div className="flex flex-wrap gap-2">
                {tableData[date].map((teacher, rowIndex: number) => (
                  <div
                    key={rowIndex}
                    className="mx-auto my-1 flex flex-wrap gap-2"
                  >
                    <Dropdown key={rowIndex} className="mx-2 flex">
                      <DropdownTrigger>
                        {/* A simple card with the teacher's image and under it their name*/}
                        <div className="flex w-24 flex-col items-center justify-start rounded-lg bg-selfprimary-50">
                          {teacher.photoUrl ? (
                            <Image
                              src={teacher.photoUrl}
                              alt={teacher.name}
                              width={96}
                              height={96}
                              className="rounded-lg"
                              unoptimized={true}
                              style={{
                                objectFit: "cover",
                                width: "96px",
                                height: "96px",
                              }}
                            />
                          ) : (
                            <div className="h-24 w-24 rounded-lg bg-selfprimary-100"></div>
                          )}
                          <p className="p-2 text-center">
                            {teacherName(teacher.name)}
                          </p>
                        </div>
                      </DropdownTrigger>

                      <DropdownMenu aria-label="Static Actions">
                        {teacher.changes &&
                          teacher.changes.map((event, eventIndex: number) => (
                            <DropdownItem
                              key={eventIndex}
                              className="text-foreground"
                              onClick={() => setSelectedEvent(event)}
                            >
                              <p>
                                {"🕒 " +
                                  [
                                    "Vasárnap",
                                    "Hétfő",
                                    "Kedd",
                                    "Szerda",
                                    "Csütörtök",
                                    "Péntek",
                                    "Szombat",
                                  ][new Date(event.date).getDay()] +
                                  " " +
                                  event.hour +
                                  ". ó"}
                                &nbsp;
                                {" 📍" + // Replace &nbsp; with nothing
                                  (event.room.replace(" ", "").length !== 0
                                    ? event.room
                                    : "???")}{" "}
                                &nbsp;
                                {"  📔" + event.subject}
                              </p>
                              <p>
                                {"   🧑🏼‍🏫 " +
                                  (event.replacementTeacher.replace(" ", "")
                                    .length !== 0
                                    ? event.replacementTeacher
                                    : "???")}{" "}
                                &nbsp;
                                {" 📝" + event.comment}
                              </p>
                            </DropdownItem>
                          ))}
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p>Nincs információ</p>
        )}

        {selectedEvent !== null && (
          <Modal
            isOpen={selectedEvent !== null}
            onClose={() => setSelectedEvent(null)}
          >
            <ModalContent>
              <ModalBody className="text-foreground">
                <p>
                  {"🕒 " +
                    [
                      "Vasárnap",
                      "Hétfő",
                      "Kedd",
                      "Szerda",
                      "Csütörtök",
                      "Péntek",
                      "Szombat",
                    ][new Date(selectedEvent.date).getDay()] +
                    " " +
                    selectedEvent.hour +
                    ". ó"}
                  &nbsp;
                  {" 📍" +
                    (selectedEvent.room.replace(" ", "").length !== 0
                      ? selectedEvent.room
                      : "???")}{" "}
                  &nbsp;
                  {"  📔" + selectedEvent.subject}
                </p>
                <p>{"Hiányzó tanár: " + selectedEvent.missingTeacher}</p>
                <p>
                  {"Helyettesítő tanár: " +
                    (selectedEvent.replacementTeacher.replace(" ", "")
                      .length !== 0
                      ? selectedEvent.replacementTeacher
                      : "???")}
                </p>
                <p>
                  {"Megjegyzés: " +
                    (selectedEvent.comment.replace(" ", "").length !== 0
                      ? selectedEvent.comment
                      : "Nincs")}
                </p>
              </ModalBody>
            </ModalContent>
          </Modal>
        )}
      </React.Fragment>
    </Skeleton>
  );
};
