import { dbreq, multipledbreq } from "./db";
import { UserType } from "./dbreq";
import { gate } from "./permissions";

export interface EventType {
  title: string | string[];
  image: string | null; // URL
  description: string | null;

  id: number;
  time: string;
  show_time: string | null;
  hide_time: string;
  tags: string[];
}

export async function getEvents() {
  return (await dbreq("SELECT * FROM events_active")) as EventType[];
}

export async function rollbackEvent(selfUser: UserType, id: number) {
  gate(selfUser, "admin");
  return await multipledbreq([
    `INSERT INTO events_preview SELECT * FROM events_active WHERE id = ${id};`,
    `DELETE FROM events_active WHERE id = ${id};`,
  ]);
}

export async function approveEvent(selfUser: UserType, id: number) {
  gate(selfUser, "admin");
  return await multipledbreq([
    `INSERT INTO events_active SELECT * FROM events_preview WHERE id = ${id};`,
    `DELETE FROM events_preview WHERE id = ${id};`,
  ]);
}

export async function rejectEvent(selfUser: UserType, id: number) {
  gate(selfUser, "admin");
  return await dbreq(`DELETE FROM events_preview WHERE id = ${id};`);
}

export async function editEvent(selfUser: UserType, event: EventType) {
  gate(selfUser, "admin");
  return await dbreq(
    `UPDATE events_preview SET title = '${event.title}', time = '${event.time}', show_time = '${event.show_time}', hide_time = '${event.hide_time}', image = '${event.image}', description = '${event.description}', tags = '${event.tags}' WHERE id = ${event.id};`,
  );
}

export async function createEvent(selfUser: UserType, event: EventType) {
  gate(selfUser, "user");
  return await dbreq(
    `INSERT INTO events_preview (title, time, show_time, hide_time, image, description, tags) VALUES ('${event.title}', '${event.time}', '${event.show_time}', '${event.hide_time}', '${event.image}', '${event.description}', '${JSON.stringify(event.tags)}');`,
  );
}
