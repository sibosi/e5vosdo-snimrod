import {
  TimetableDay,
  TimetableLesson,
  TimetableWeek,
} from "@/apps/web/app/api/timetable/route";
import { dbreq } from "./db";
import { UserType } from "./dbreq";
import { gate } from "./permissions";

interface DBClassRow {
  id: number;
  room: string;
  slot: string; // (h, k, s, c, p) + (0-9)
  is_free: 0 | 1;
  code: string; // classID
  teacher: string;
  details: string;
}

function makeRoomBeutiful(room: string) {
  if (!isNaN(Number(room))) {
    return room + ".";
  }
  return room;
}

export async function extendLessonsWithRooms(
  selfUser: UserType,
  lessons: TimetableLesson[],
): Promise<TimetableLesson[]> {
  gate(selfUser, "user");

  const queries = lessons.map(async (lesson) => {
    if (lesson.room) return;
    const rooms = await dbreq(
      `SELECT * FROM classes WHERE code = ? AND slot = ?`,
      [lesson.code, lesson.slot],
    );
    if (rooms.length > 0) {
      lesson.room = makeRoomBeutiful(rooms[0].room);
    }
  });

  await Promise.all(queries);
  return lessons;
}

export async function extendTimetableWeekWithRooms(
  selfUser: UserType,
  timetable: TimetableWeek,
): Promise<TimetableWeek> {
  gate(selfUser, "user");

  const queries = Object.values(timetable).map(async (day: TimetableDay) => {
    const lessons = Object.values(day);
    await extendLessonsWithRooms(selfUser, lessons);
  });

  await Promise.all(queries);
  return timetable;
}
