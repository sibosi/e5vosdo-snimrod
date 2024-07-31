// Export the timetable data to a MySQL database

import { dbreq, multipledbreq } from "@/db/db";
import timetable from "@/timetable.json";

/*
Example timetable.json:
[
{
    "EJG_classes": ["11.AB", ["11.A", "11.B"]],
    "day": "P",
    "start_time": "14:30",
    "room": "Testnevel\u00e9s",
    "group": null,
    "teacher": "T\u00f3th Andrea",
    "subject": "testnevel\u00e9s",
    "end_time": "15:15"
}, ...]
*/

export async function exportTimetable() {
  // Drop the table if it exists
  console.log("Dropping table if exists...");
  await dbreq("DROP TABLE IF EXISTS timetable");
  console.log("Creating table...");
  // Create the table if it doesn't exist
  await dbreq(`CREATE TABLE IF NOT EXISTS timetable (
        id INT AUTO_INCREMENT PRIMARY KEY,
        day VARCHAR(255),
        start_time VARCHAR(255),
        end_time VARCHAR(255),
        room VARCHAR(255),
        EJG_classes JSON,
        group_name VARCHAR(255),
        teacher VARCHAR(255),
        subject VARCHAR(255)
    )`);

  let Q: string[] = [];

  // Insert the data
  for (const lesson of timetable) {
    const {
      day,
      start_time,
      end_time,
      room,
      group,
      teacher,
      subject,
      EJG_classes,
    } = lesson;

    if (typeof EJG_classes === "string" || EJG_classes.length == 1) {
      Q.push(
        `INSERT INTO timetable (day, start_time, end_time, room, EJG_classes, group_name, teacher, subject)VALUES ("${day}", "${start_time}", "${end_time}", "${room}", '["${EJG_classes}"]', "${group}", "${teacher}", "${subject}")`
      );
    } else if (typeof EJG_classes[1] === "string") {
      Q.push(
        `INSERT INTO timetable (day, start_time, end_time, room, EJG_classes, group_name, teacher, subject)VALUES ("${day}", "${start_time}", "${end_time}", "${room}", '["${
          EJG_classes[0] + '", ["' + EJG_classes[1]
        }"]]', "${group}", "${teacher}", "${subject}")`
      );
    } else if (typeof EJG_classes[1] != "string") {
      Q.push(
        `INSERT INTO timetable (day, start_time, end_time, room, EJG_classes, group_name, teacher, subject)VALUES ("${day}", "${start_time}", "${end_time}", "${room}", '["${
          EJG_classes[0] + '", ["' + EJG_classes[1].join('", "')
        }"]]', "${group}", "${teacher}", "${subject}")`
      );
    }
  }

  console.log("Executing queries...");
  const resp = await multipledbreq(Q);
  console.log("Done!");
  return resp;
}

export async function getTimetable() {
  return await dbreq("SELECT * FROM timetable");
}

/*
Python equivalent:
def get_lessons(attributes: dict, auto_find=False, specific_group=True) -> list[Lesson] | None:
    keys = list(attributes.keys())

    lessons = table
    def get_lessons(lessons, key: str, value):
        response = []

        for lesson in lessons:
            lesson: Lesson
            if key == 'EJG_class':
                if specific_group:
                    if value in lesson.EJG_classes:
                        response.append(lesson)
                else:
                    if len(lesson.EJG_classes) >= 2:
                        if value in lesson.EJG_classes[1]:
                            response.append(lesson)
                    
            elif key == 'day':
                if lesson.day == value:
                    response.append(lesson)
            elif key == 'start_time':
                if lesson.start_time == value:
                    response.append(lesson)
            elif key == 'subject':
                if lesson.subject == value:
                    response.append(lesson)
            elif key == 'room':
                if lesson.room == value:
                    response.append(lesson)
            elif key == 'teacher':
                if lesson.teacher == value:
                    response.append(lesson)
            elif key == 'group':
                if lesson.group == value or lesson.group == None or lesson.group == '?':
                    response.append(lesson)
            
        return response

    for key in keys:
        lessons = get_lessons(lessons, key, attributes[key])

    return lessons
    if len(lessons) > 1:
        return lessons
        raise ValueError(f'There are more than one lesson with the given attributes.\n{get_str_list(lessons)}')
    elif len(lessons) == 0:
        return lessons
        if 'group' in keys and auto_find:
            if attributes['group'] == 1: attributes['group'] = 2
            elif attributes['group'] == 2: attributes['group'] = 1
            else: return None

            return get_lessons(attributes, auto_find=False)
        else:
            return None
    else:
        lesson = lessons[0]
        lesson: Lesson
        return lesson
*/

export async function getLessons(
  attributes: { [key: string]: string },
  auto_find = false,
  specific_group = true
) {
  const keys = Object.keys(attributes);

  let lessons = (await getTimetable()) as any[];

  for (const key of keys) {
    lessons = lessons.filter((lesson: any) => {
      if (key === "EJG_class") {
        if (specific_group) {
          if (lesson.EJG_classes.includes(attributes[key])) return true;
        } else {
          if (lesson.EJG_classes[1].includes(attributes[key])) return true;
        }
      } else if (lesson[key] === attributes[key]) return true;
    });
  }
}

exportTimetable();
