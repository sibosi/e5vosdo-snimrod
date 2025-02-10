import { NextResponse } from "next/server";
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

  author?: string;
  show_author?: boolean;
  show_at_carousel?: boolean;
  show_at_events?: boolean;
}

export async function getEvents() {
  return (await dbreq("SELECT * FROM events_active")) as EventType[];
}

export async function getPreviewEvent(selfUser: UserType, id: number) {
  gate(selfUser, "admin");
  const resp = (await dbreq(
    `SELECT * FROM events_preview WHERE id = ${id}`,
  )) as EventType[];
  if (!resp?.length) return null;
  const event = resp[0];
  try {
    event.tags = JSON.parse(event.tags as unknown as string) || [];
  } catch {
    event.tags = [];
  }
  return event;
}

export async function getCarouselEvents() {
  return (await dbreq(
    "SELECT * FROM events_active WHERE show_at_carousel = 1",
  )) as EventType[];
}

export async function getEventEvents() {
  return (await dbreq(
    "SELECT * FROM events_active WHERE show_at_events = 1",
  )) as EventType[];
}

export async function getPreviewEvents(selfUser: UserType) {
  gate(selfUser, "admin");
  return (await dbreq("SELECT * FROM events_preview")) as EventType[];
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
    `UPDATE events_preview SET title = '${event.title}', time = '${event.time}', show_time = '${event.show_time}', hide_time = '${event.hide_time}', image = '${event.image}', description = '${event.description}', tags = '${event.tags}', show_author = ${event.show_author}, show_at_carousel = ${event.show_at_carousel}, show_at_events = ${event.show_at_events} WHERE id = ${event.id};`,
  );
}

export async function createEvent(selfUser: UserType, event: EventType) {
  gate(selfUser, "user");
  return await dbreq(
    `INSERT INTO events_preview (title, time, show_time, hide_time, image, description, tags, show_author, show_at_carousel, show_at_events) VALUES ('${event.title}', '${event.time}', '${event.show_time}', '${event.hide_time}', '${event.image}', '${event.description}', '${JSON.stringify(event.tags)}', ${event.show_author}, ${event.show_at_carousel}, ${event.show_at_events});`,
  );
}
