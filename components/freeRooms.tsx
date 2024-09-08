"use client";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import React, { useEffect, useState } from "react";

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

const FLOORS_NAMES: Record<string, string> = {
  "-1": "Alagsor",
  "0": "Földszint",
  "0.5": "Félemelet",
  "1": "1. emelet",
  "2": "2. emelet",
  "3": "3. emelet",
  "?": "Ismeretlen",
};

const getCurrentLessonOrder = () => {
  let currentLessonOrder = 0;
  let difference = Infinity;

  const currentTime = new Date();

  START_TIMES.forEach((time, index) => {
    if (
      difference >
      Math.abs(
        currentTime.getTime() -
          new Date(
            `${currentTime.getFullYear()}-${currentTime.getMonth() + 1}-${currentTime.getDate()} ${time}`,
          ).getTime(),
      )
    ) {
      currentLessonOrder = index;
      difference = Math.abs(
        currentTime.getTime() -
          new Date(
            `${currentTime.getFullYear()}-${currentTime.getMonth() + 1}-${currentTime.getDate()} ${time}`,
          ).getTime(),
      );
    }
  });

  return currentLessonOrder;
};

async function getFreeRooms(day: "H" | "K" | "SZ" | "CS" | "P", time: string) {
  if (time === START_TIMES[8] || time === START_TIMES[0]) return [];
  const resp = await fetch("/api/getFreeRooms", {
    method: "POST",
    body: JSON.stringify({ day, time }),
  }).then((res) => res.json());

  return resp as string[];
}

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

const sortRoomsByFloor = (rooms: string[]) => {
  const sortedRooms = {
    "-1": [] as string[],
    "0": [] as string[],
    "0.5": [] as string[],
    "1": [] as string[],
    "2": [] as string[],
    "3": [] as string[],
    "?": [] as string[],
  };

  rooms.forEach((room) => {
    if (room.includes("alagsor")) sortedRooms["-1"].push(room);
    else if (room.includes("földszint")) sortedRooms["0"].push(room);
    else if (room.includes("fél")) sortedRooms["0.5"].push(room);
    else if (room.includes("1. emelet")) sortedRooms["1"].push(room);
    else if (room.includes("2. emelet")) sortedRooms["2"].push(room);
    else if (room.includes("3. emelet")) sortedRooms["3"].push(room);
    else sortedRooms["?"].push(room);
  });

  return sortedRooms;
};

const FreeRooms = () => {
  const [selectedDayKeys, setSelectedDayKeys] = React.useState<any>(
    new Set([
      [
        ["Hétfő", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Hétfő"][
          new Date().getDay()
        ],
      ],
    ]),
  );
  const [startOrder, setStartOrder] = useState<number>(getCurrentLessonOrder());
  const [freeRooms, setFreeRooms] = useState<string[]>([]);
  const [freeRoomsByFloor, setFreeRoomsByFloor] = useState<
    Record<"-1" | "0" | "0.5" | "1" | "2" | "3" | "?", string[]>
  >({
    "-1": [] as string[],
    "0": [] as string[],
    "0.5": [] as string[],
    "1": [] as string[],
    "2": [] as string[],
    "3": [] as string[],
    "?": [] as string[],
  });

  useEffect(() => {
    getFreeRooms(
      selectedDayKeys === "Hétfő"
        ? "H"
        : selectedDayKeys === "Kedd"
          ? "K"
          : selectedDayKeys === "Szerda"
            ? "SZ"
            : selectedDayKeys === "Csütörtök"
              ? "CS"
              : selectedDayKeys === "Péntek"
                ? "P"
                : "H",
      START_TIMES[startOrder],
    ).then((rooms) => setFreeRooms(rooms));
  }, [selectedDayKeys, startOrder]);

  useEffect(() => {
    setFreeRoomsByFloor(sortRoomsByFloor(freeRooms));
  }, [freeRooms]);

  return (
    <div>
      <div className="mb-2">
        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered" className="capitalize">
              {selectedDayKeys}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Single selection example"
            variant="flat"
            disallowEmptySelection
            selectionMode="single"
            className="text-foreground-600"
            selectedKeys={selectedDayKeys}
            onSelectionChange={(keys: any) => {
              setSelectedDayKeys(new Set(keys));
              setFreeRooms([]);
            }}
          >
            <DropdownItem key="Hétfő">Hétfő</DropdownItem>
            <DropdownItem key="Kedd">Kedd</DropdownItem>
            <DropdownItem key="Szerda">Szerda</DropdownItem>
            <DropdownItem key="Csütörtök">Csütörtök</DropdownItem>
            <DropdownItem key="Péntek">Péntek</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered" className="capitalize">
              {startOrder + ". " + START_TIMES[startOrder]}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Single selection example"
            variant="flat"
            disallowEmptySelection
            selectionMode="single"
            className="text-foreground-600"
            selectedKeys={new Set([START_TIMES[startOrder]])}
            onSelectionChange={(keys: any) => {
              setStartOrder(START_TIMES.indexOf(keys.values().next().value));
              setFreeRooms([]);
            }}
          >
            {START_TIMES.map((time, index) => (
              <DropdownItem key={time}>{index + ". " + time}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>

      {startOrder !== 8 && startOrder !== 0 ? (
        <div className="flex flex-wrap">
          <div className="m-2 w-52 rounded-lg border-2 border-selfsecondary-200 bg-selfsecondary-50 p-2">
            <h4 className="text-lg font-bold">Figyelem!</h4>
            <span>
              A be nem jelentett teremváltozások miatt előfordulhatnak hibák. Az
              esetleges hibákért elnézést kérünk! (És felelősséget nem
              vállalunk.) ( ͡° ͜ʖ ͡°)
            </span>
          </div>
          {Object.keys(freeRoomsByFloor).map(
            (floor) =>
              freeRoomsByFloor[
                floor as "-1" | "0" | "0.5" | "1" | "2" | "3" | "?"
              ].length > 0 && (
                <div
                  key={floor}
                  className="m-2 rounded-lg border-2 border-selfprimary-200 bg-selfprimary-50 p-2"
                >
                  <h4 className="text-lg font-bold">{FLOORS_NAMES[floor]}</h4>
                  <div>
                    {freeRoomsByFloor[
                      floor as "-1" | "0" | "0.5" | "1" | "2" | "3" | "?"
                    ].map((room) => (
                      <p key={room}>- {toShortRoom(room)}</p>
                    ))}
                  </div>
                </div>
              ),
          )}
        </div>
      ) : (
        <p>A modul 0. és 8. órában nem használható.</p>
      )}
    </div>
  );
};

export default FreeRooms;
