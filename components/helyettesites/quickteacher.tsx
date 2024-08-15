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

type Teacher = {
  country: string;
  rank: number;
  gold: number;
  silver: number;
  bronze: number;
};

type rowType = [string, string, string, Teacher[]];

export const QuickTeachers = () => {
  const { data: tableData, error } = useSWR("/api/", fetcher);
  const isLoaded = !error && !!tableData;

  return (
    <Skeleton
      isLoaded={isLoaded}
      className="h-auto w-auto rounded-lg text-foreground"
    >
      <React.Fragment>
        {error && <p>Error fetching data</p>}
        {!isLoaded && !error && <p>Loading...</p>}
        {isLoaded && tableData && tableData.length ? (
          tableData.map((teacher: rowType, rowIndex: number) => (
            <Dropdown key={rowIndex} className="md: block">
              <DropdownTrigger>
                <User
                  as="button"
                  type="button"
                  avatarProps={{
                    isBordered: true,
                    src: teacher[1],
                  }}
                  className="p-2 transition-transform"
                  description={teacher[2]}
                  name={teacher[0]}
                />
              </DropdownTrigger>

              <DropdownMenu aria-label="Static Actions">
                {teacher[3] &&
                  teacher[3].map((event: any, eventIndex: number) => (
                    <DropdownItem key={eventIndex} className="text-foreground">
                      {event[7] +
                        " | " +
                        event[8] +
                        ". ó | terem: " +
                        event[9] +
                        " | " +
                        event[4] +
                        " | " +
                        event[5]}
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
