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
} from "@heroui/react";
import { Change, TeacherChange } from "@/app/api/route";
import Image from "next/image";
import teacherName from "@/app/api/teacherName";
import { useSubstitutions } from "@/hooks/useSubstitutions";

export const QuickTeachers = ({
  isNewView = false,
}: {
  isNewView?: boolean;
}) => {
  const { tableData, isLoaded } = useSubstitutions();
  const [selectedEvent, setSelectedEvent] = useState<Change | null>(null);

  const oldViewLayout = (teacher: TeacherChange, rowIndex: number) => (
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
  );

  const newViewLayout = (teacher: TeacherChange, rowIndex: number) => (
    <DropdownTrigger className="flex items-center gap-2">
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
        <p className="p-2 text-center">{teacherName(teacher.name)}</p>
      </div>
    </DropdownTrigger>
  );

  const usedLayout = isNewView ? newViewLayout : oldViewLayout;

  return (
    <Skeleton
      isLoaded={isLoaded}
      className="h-auto w-auto rounded-lg text-foreground"
    >
      {isLoaded && tableData && Object.keys(tableData).length ? (
        Object.keys(tableData).map((date) => (
          <div
            key={date}
            className="my-2 rounded-lg border-1 border-selfprimary-100 bg-selfprimary-bg p-2 shadow-md"
          >
            <h5 className="text-center font-bold text-foreground">
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
            </h5>
            <div
              className={
                isNewView
                  ? "flex flex-wrap justify-around gap-4"
                  : "flex flex-wrap items-center"
              }
            >
              {tableData[date].map((teacher, rowIndex: number) => (
                <Dropdown key={rowIndex} className="md:block">
                  {usedLayout(teacher, rowIndex)}

                  <DropdownMenu
                    aria-label="Static Actions"
                    className="rounded-xl bg-selfprimary-bg"
                  >
                    {teacher.changes?.map((event, eventIndex: number) => (
                      <DropdownItem
                        key={eventIndex}
                        className="text-foreground"
                        onPress={() => setSelectedEvent(event)}
                      >
                        <div className="flex items-center gap-2">
                          <Image
                            className="h-10 w-10 rounded-full border-2 border-foreground-200 object-cover"
                            width={40}
                            height={40}
                            src={event.replacementTeacherPhotoUrl}
                            alt={event.replacementTeacher}
                            unoptimized={true}
                          />
                          <div>
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
                                event.period +
                                ". ó"}
                              &nbsp;
                              {" 📍" +
                                (event.room.replace(" ", "").length === 0
                                  ? "???"
                                  : event.room)}{" "}
                              &nbsp;
                              {"  📔" + event.subject}
                            </p>
                            <p>
                              {"   🧑🏼‍🏫 " +
                                (event.replacementTeacher.replace(" ", "")
                                  .length === 0
                                  ? "???"
                                  : event.replacementTeacher)}{" "}
                              &nbsp;
                              {" 📝" + event.comment}
                            </p>
                          </div>
                        </div>
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
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
          className="bg-selfprimary-bg"
        >
          <ModalContent>
            <ModalBody className="text-foreground">
              <div className="flex items-center gap-2">
                <Image
                  className="h-28 w-28 rounded-full border-2 border-foreground-200 object-cover text-foreground"
                  width={112}
                  height={112}
                  src={selectedEvent.replacementTeacherPhotoUrl}
                  alt={selectedEvent.replacementTeacher}
                  unoptimized={true}
                />
                <div>
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
                      selectedEvent.period +
                      ". ó"}
                    &nbsp;
                    {" 📍" +
                      (selectedEvent.room.replace(" ", "").length === 0
                        ? "???"
                        : selectedEvent.room)}{" "}
                    &nbsp;
                    {"  📔" + selectedEvent.subject}
                  </p>
                  <p>{"Hiányzó tanár: " + selectedEvent.missingTeacher}</p>
                  <p>
                    {"Helyettesítő tanár: " +
                      (selectedEvent.replacementTeacher.replace(" ", "")
                        .length === 0
                        ? "???"
                        : selectedEvent.replacementTeacher)}
                  </p>
                  <p>
                    {"Megjegyzés: " +
                      (selectedEvent.comment.replace(" ", "").length === 0
                        ? "Nincs"
                        : selectedEvent.comment)}
                  </p>
                </div>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Skeleton>
  );
};

export const QuickTeachersDev = () => {
  return <QuickTeachers isNewView={true} />;
};
