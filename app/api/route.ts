import { NextResponse } from "next/server";
import axios from "axios";
import cheerio from "cheerio";
const iconv = require("iconv-lite");
import tanarok_tabla from "@/components/helyettesites/osszestanar.json";

async function update() {
  console.log("Updating the table...");
  console.log(new Date().toISOString());

  const TEACHER_AVATAR =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcOsfFbgyCMm_frzL_cdUQfSjOJD1RSWhHFKKUKZWhaQ&s";

  const url = "https://suli.ejg.hu/intranet/helyettes/refresh.php";

  const response = await axios.get(url, { responseType: "arraybuffer" }); // Specify responseType as 'arraybuffer' to handle binary data

  const html_content = iconv.decode(response.data, "iso-8859-1"); // Assuming website uses

  const $ = cheerio.load(html_content);

  const data: any[][] = [];
  $("tr").each((i: any, row: any) => {
    const row_data: string[] = [];
    $(row)
      .find("td")
      .each((j: any, cell: any) => {
        row_data.push($(cell).text());
      });

    if (row_data.length !== 0) data.push(row_data);
  });

  let quick_data: any[][] = [];
  data.forEach((new_event) => {
    let i = 0;
    for (const added_event of quick_data) {
      if (new_event[1] === added_event[0] && i != -1) {
        quick_data[i][2].push(new_event);
        i = -1;
        break;
      }
      i++;
    }

    if (i != -1) {
      let found = false;
      for (const tanar of tanarok_tabla) {
        if (tanar["Name"] === new_event[1] && !found && tanar["Photo"]) {
          quick_data.push([new_event[1], tanar["Photo"], [new_event]]);
          found = true;
          break;
        }
      }
      if (!found) quick_data.push([new_event[1], TEACHER_AVATAR, [new_event]]);
    }
  });

  const napok: string[] = [];
  quick_data.forEach((teacherData) => {
    teacherData[2].forEach((event: any[]) => {
      const ora_terem = event[2];
      const ora = ora_terem.charAt(0);
      let nap = "";
      switch (ora) {
        case "h":
          nap = "HÃ©tfÅ";
          break;
        case "k":
          nap = "Kedd";
          break;
        case "s":
          nap = "Szerda";
          break;
        case "c":
          nap = "CsÃ¼tÃ¶rtÃ¶k";
          nap = new Date().toString();
          break;
        case "p":
          nap = "PÃ©ntek";
          break;
      }
      event.push(nap);
      event.push(
        ora_terem.split(" ")[0].charAt(ora_terem.split(" ")[0].length - 1)
      );
      if (!napok.includes(nap)) napok.push(nap);

      const terem = ora_terem.split(" ")[1].slice(1);
      event.push(terem);
    });
  });

  //fs.writeFileSync("public/storage/teachers.json", JSON.stringify(data));

  // fs.writeFileSync("public/storage/quick-teachers.json",JSON.stringify(quick_data));

  console.log("Updating ended");

  console.log("Gate 2:");
  console.log(quick_data);

  return {
    props: {
      data: quick_dataí,
    },
  };
}

export async function GET() {
  const table = await update();
  return NextResponse.json({
    req: table,
  });
}

export async function POST(request: Request) {
  const data = await request.json();
  return NextResponse.json({
    data,
  });
}
