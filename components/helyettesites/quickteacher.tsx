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
} from "@nextui-org/react";
import { Change, TeacherChange } from "@/app/api/route";
import { Alert } from "../home/alert";

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

export const QuickTeachers = () => {
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
      <Alert className="mb-4 border-selfprimary-300 bg-selfprimary-100">
        Kattints a tanárokra, hogy megtekintsd a helyettesítéseket!
      </Alert>
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
