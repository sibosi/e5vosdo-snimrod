"use client";
import React from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  User,
  Skeleton,
} from "@nextui-org/react";
import useSWR from "swr";
import { TeacherChange } from "@/app/api/route";

export const QuickTeachers = () => {
  const { data: tableDataKhm, error } = useSWR("/api/", fetcher);
  const isLoaded = !error && !!tableDataKhm;

  const tableData = tableDataKhm as TeacherChange[];

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
                    <DropdownItem key={eventIndex} className="text-foreground">
                      {"🕒 " +
                        ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek"][
                          new Date(event.date).getDay()
                        ] +
                        " " +
                        event.hour +
                        ". ó 📍" +
                        event.room +
                        "  📔" +
                        event.subject +
                        "  🧑🏼‍🏫" +
                        event.replacementTeacher}
                    </DropdownItem>
                  ))}
              </DropdownMenu>
            </Dropdown>
          ))
        ) : (
          <p>Nincs információ</p>
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
