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

import { useState, useEffect } from "react";

type Teacher = {
  country: string;
  rank: number;
  gold: number;
  silver: number;
  bronze: number;
};

type rowType = [string, string, Teacher[]];
const rows: rowType[] = [];

export const QuickTeachers = () => {
  const [tableData, setTableData] = useState<rowType[]>(rows);
  const [isLoaded, setIsLoaded] = React.useState(false);

  useEffect(() => {
    // Define a function to fetch data from the server API
    const fetchData = async () => {
      try {
        // Make a GET request to the server API
        const response = await fetch("/api/cron");

        // Check if the response is successful
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        // Parse the JSON response
        const jsonData = await response.json();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    // Call the fetchData function when the component mounts
    fetchData();
  }, []); // Empty dependency array ensures this effect runs only once

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
    <Skeleton
      isLoaded={isLoaded}
      className="rounded-lg h-auto w-auto text-foreground"
    >
      <React.Fragment>
        {tableData.length ? (
          tableData.map((teacher: rowType, rowIndex: number) => (
            <Dropdown key={rowIndex} className="block md:">
              <DropdownTrigger>
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
                {teacher[2] &&
                  teacher[2].map((event: any, eventIndex: number) => (
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
