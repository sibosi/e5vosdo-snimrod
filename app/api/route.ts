import { NextResponse } from "next/server";
import axios from "axios";
import cheerio from "cheerio";
const iconv = require("iconv-lite");
import tanarok_tabla from "@/src/osszestanar.json";

let cachedData: any[] | null = null;
let lastUpdated: number | null = null;
const CACHE_DURATION = (3600 * 1000) / 2; // Cache duration in milliseconds (1 hour)

async function update() {
  console.log("Updating the table...");
  console.log(new Date().toISOString());

  const TEACHER_AVATAR =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcOsfFbgyCMm_frzL_cdUQfSjOJD1RSWhHFKKUKZWhaQ&s";

  const url = "https://suli.ejg.hu/intranet/helyettes/refresh.php";

  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const html_content = iconv.decode(response.data, "iso-8859-1");

    const $ = cheerio.load(html_content);

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
        let found = false;
        for (const tanar of tanarok_tabla) {
          if (tanar["Name"] === new_event[1] && !found && tanar["Photo"]) {
            quick_data.push([
              new_event[1],
              tanar["Photo"],
              tanar["Subjects"],
              [new_event],
            ]);
            found = true;
            break;
          }
        }
        if (!found)
          quick_data.push([
            new_event[1],
            TEACHER_AVATAR,
            "@Tanár",
            [new_event],
          ]);
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
        event.push(nap);
        event.push(
          ora_terem.split(" ")[0].charAt(ora_terem.split(" ")[0].length - 1),
        );
        if (!napok.includes(nap)) napok.push(nap);

        const terem = ora_terem.split(" ")[1].slice(1);
        event.push(terem);
      });
    });

    cachedData = quick_data;
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
