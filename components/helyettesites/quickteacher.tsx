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

import { teachersConfig } from "@/config/teachers";
import { useState, useEffect } from "react";
import { title } from "../primitives";
import clsx from "clsx";

type Teacher = {
  country: string;
  rank: number;
  gold: number;
  silver: number;
  bronze: number;
};

type rowType = [string, string, Teacher[]];
const columns = teachersConfig.showHeaders;
const rows: rowType[] = [];

export const QuickTeachers = () => {
  const [tableData, setTableData] = useState<rowType[]>(rows);
  const [isLoaded, setIsLoaded] = React.useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/storage/quick-teachers.json"); // Adjust path if needed
      const data = await res.json();
      setTableData(data as rowType[]); // Type assertion for clarity
      setIsLoaded(true);
    };

    fetchData();
  }, [isLoaded]);

  return (
    <Skeleton isLoaded={isLoaded} className="rounded-lg h-auto w-auto">
      <h1 className="text-2xl font-medium py-1">Helyettesítések</h1>
      <br />

      <React.Fragment>
        {tableData.map((teacher: rowType, rowIndex: number) => (
          <Dropdown key={rowIndex}>
            <DropdownTrigger>
              {/* Wrap User in a React Fragment */}

              <User
                as="button"
                type="button"
                avatarProps={{
                  isBordered: true,
                  src: teacher[1],
                }}
                className="transition-transform p-2"
                description="@Tanár"
                name={teacher[0]}
              />
            </DropdownTrigger>

            <DropdownMenu aria-label="Static Actions">
              {teacher[2].map((event: any, eventIndex: number) => (
                <DropdownItem key={eventIndex}>{event[0]}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        ))}
      </React.Fragment>
    </Skeleton>
  );
};
