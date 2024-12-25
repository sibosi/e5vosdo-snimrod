import { dbreq } from "./db";
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
  return (await dbreq("SELECT * FROM events")) as EventType[];
}

export async function updateEvent(selfUser: UserType, event: EventType) {
  gate(selfUser, "admin");
  if (event.id === undefined)
    return await dbreq(
      `INSERT INTO events (title, time, show_time, hide_time, image, description, tags) VALUES ('${event.title}', '${event.time}', '${event.show_time}', '${event.hide_time}', '${event.image}', '${event.description}', '${event.tags}');`,
    );
  else
    return await dbreq(
      `UPDATE events SET title = '${event.title}', time = '${event.time}', show_time = '${event.show_time}', hide_time = '${event.hide_time}', image = '${event.image}', description = '${event.description}', tags = '${event.tags}' WHERE id = ${event.id};`,
    );
}
