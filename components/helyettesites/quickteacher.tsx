"use client";
import React, { useState } from "react";
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
import useSWR from "swr";
import { Change, TeacherChange } from "@/app/api/route";

export const QuickTeachers = () => {
  const { data: tableDataKhm, error } = useSWR("/api/", fetcher);
  const isLoaded = !error && !!tableDataKhm;

  const tableData = tableDataKhm as TeacherChange[];

  const [selectedEvent, setSelectedEvent] = useState<Change | null>(null);

  return (
    <Skeleton
      isLoaded={isLoaded}
      className="h-auto w-auto rounded-lg text-foreground"
    >
      <React.Fragment>
        {error && <p>Error fetching data</p>}
        {!isLoaded && !error && <p>Loading...</p>}
        {isLoaded && tableData && tableData.length ? (
          tableData.map((teacher, rowIndex: number) => (
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
                          (event.replacementTeacher.replace(" ", "").length !==
                          0
                            ? event.replacementTeacher
                            : "???")}{" "}
                        &nbsp;
                        {" 📝" + event.comment}
                      </p>
                    </DropdownItem>
                  ))}
              </DropdownMenu>
            </Dropdown>
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

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
};
