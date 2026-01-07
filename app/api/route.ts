import { NextResponse } from "next/server";
import axios from "axios";
import { load } from "cheerio";
const iconv = require("iconv-lite");
import teacherDataByNames from "@/public/storage/teacherDataByNames.json";
import teacherName from "./teacherName";
const teacherByName = teacherDataByNames as any;

export interface Change {
  date: string;
  missingTeacher: string;
  hourRoom: string;
  group: string;
  subject: string;
  replacementTeacher: string;
  replacementTeacherPhotoUrl: string;
  comment: string;
  day: string;
  period: string;
  room: string;
}

export interface TeacherChange {
  name: string;
  photoUrl: string;
  subjects: string;
  changes: Change[];
}

let cachedData: TeacherChange[] | null = null;
let lastUpdated: number | null = null;
const CACHE_DURATION = 15 * 60 * 1000; // Cache duration in milliseconds (15 minutes)

async function update() {
  console.log("Updating the table...");
  console.log(new Date().toISOString());

  const TEACHER_AVATAR = "/question-mark.svg";
  // https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcOsfFbgyCMm_frzL_cdUQfSjOJD1RSWhHFKKUKZWhaQ&s

  const url = "https://suli.ejg.hu/intranet/helyettes/refresh.php";

  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const html_content = iconv.decode(response.data, "iso-8859-1");

    const $ = load(html_content);

    const data: any[][] = [];
    $("tr").each((i, row) => {
      const row_data: string[] = [];
      $(row)
        .find("td")
        .each((j, cell) => {
          row_data.push($(cell).text());
        });

      if (row_data.length !== 0) data.push(row_data);
    });

    let quick_data: any[][] = [];
    data.forEach((new_event) => {
      let i = 0;
      for (const added_event of quick_data) {
        if (new_event[1] === added_event[0] && i != -1) {
          quick_data[i][3].push(new_event);
          i = -1;
          break;
        }
        i++;
      }

      if (i != -1) {
        let teacherData = teacherByName[teacherName(new_event[1])];
        if (teacherData) {
          quick_data.push([
            new_event[1],
            teacherData.Photo,
            teacherData.Subjects,
            [new_event],
          ]);
        } else {
          quick_data.push([
            new_event[1],
            TEACHER_AVATAR,
            "@Tanár",
            [new_event],
          ]);
        }
      }
    });

    const napok: string[] = [];
    quick_data.forEach((teacherData) => {
      teacherData[3].forEach((event: any[]) => {
        const ora_terem = event[2];
        const ora = ora_terem.charAt(0);
        let nap = "";
        switch (ora) {
          case "h":
            nap = "Hétfő";
            break;
          case "k":
            nap = "Kedd";
            break;
          case "s":
            nap = "Szerda";
            break;
          case "c":
            nap = "Csütörtök";
            break;
          case "p":
            nap = "Péntek";
            break;
        }
        event.push(
          nap,
          ora_terem.split("/")[0].charAt(ora_terem.split(" ")[0].length - 1),
        );
        if (!napok.includes(nap)) napok.push(nap);

        const terem = ora_terem.split("/")[1];
        event.push(terem);
      });
    });

    const pretty_data = quick_data.map((teacherData) => {
      const name = teacherData[0];
      const photoUrl = teacherData[1];
      const subjects = teacherData[2];
      const changes = teacherData[3].map((event: any) => {
        const date = event[0];
        const missingTeacher = event[1];
        const hourRoom = event[2];
        const group = event[3];
        const subject = event[4];
        const replacementTeacher = event[5].trimEnd();
        const replacementTeacherPhotoUrl =
          teacherByName[teacherName(replacementTeacher)]?.Photo ||
          TEACHER_AVATAR;
        const comment = event[6];
        const day = event[7];
        const period = event[8];
        const room =
          period == "0" && String(event[9]).endsWith(" 0")
            ? String(event[9]).replaceAll(" 0", "")
            : event[9];

        return {
          date,
          missingTeacher,
          hourRoom,
          group,
          subject,
          replacementTeacher,
          replacementTeacherPhotoUrl,
          comment,
          day,
          period,
          room,
        };
      });

      return {
        name,
        photoUrl,
        subjects,
        changes,
      };
    });

    cachedData = pretty_data as TeacherChange[];
    lastUpdated = Date.now();

    return cachedData;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

export async function GET() {
  // Check if cached data is available and not expired
  if (cachedData && lastUpdated && Date.now() - lastUpdated < CACHE_DURATION) {
    console.log("Using cached data...");
    return NextResponse.json(cachedData);
  }

  // Fetch and update data if cache is expired or not available
  const data = await update();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const data = await request.json();
  return NextResponse.json({ data });
}
