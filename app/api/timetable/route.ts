import { getAuth } from "@/db/dbreq";
import { gate } from "@/db/permissions";
import { extendTimetableWeekWithRooms } from "@/db/timetableRooms";
import { load } from "cheerio";

export interface TimetableLesson {
  code: string;
  teacher: string;
  slot: string;
  subject_code: string;
  subject_name: string;
  room?: string;
}

export interface TimetableDay {
  0: TimetableLesson;
  1: TimetableLesson;
  2: TimetableLesson;
  3: TimetableLesson;
  4: TimetableLesson;
  5: TimetableLesson;
  6: TimetableLesson;
  7: TimetableLesson;
}

export interface TimetableWeek {
  Hétfő: TimetableDay;
  Kedd: TimetableDay;
  Szerda: TimetableDay;
  Csütörtök: TimetableDay;
  Péntek: TimetableDay;
}

async function getTimetable(
  studentCode: string,
  password: string,
): Promise<TimetableWeek | null> {
  const selfUser = await getAuth();
  if (!selfUser) throw new Error("User not authenticated");
  gate(selfUser, "user");

  const passwordOM = password + studentCode.slice(-3);

  const response = await fetch(
    "https://suli.ejg.hu/intranet/szulkuk/szulkuk.php",
    {
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,hu;q=0.7",
        "cache-control": "no-cache",
        "content-type": "application/x-www-form-urlencoded",
        pragma: "no-cache",
        "sec-ch-ua":
          '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "frame",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        Referer: "https://suli.ejg.hu/intranet/szulkuk/menu.php",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: `EMAIL=%28%3A&DIAKKOD=${studentCode}&OMKOD=${passwordOM}&orarend=V%E1laszt`,
      method: "POST",
    },
  );

  const buffer = await response.arrayBuffer();
  const html_content = new TextDecoder("windows-1250").decode(buffer);

  if (
    !html_content.includes("<BIG>") ||
    !html_content.includes("órarendje</BIG>")
  ) {
    return null;
  }

  const $ = load(html_content);

  const timetable: TimetableWeek = {
    Hétfő: {} as TimetableDay,
    Kedd: {} as TimetableDay,
    Szerda: {} as TimetableDay,
    Csütörtök: {} as TimetableDay,
    Péntek: {} as TimetableDay,
  };

  const days = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek"] as const;

  for (let period = 0; period <= 7; period++) {
    const codeRow = $(`tr:contains("${period}.")`);
    const teacherRow = codeRow.next();

    days.forEach((day, dayIndex) => {
      const lessonCode = codeRow
        .find("td")
        .eq(dayIndex + 1)
        .text()
        .trim();
      const teacherName = teacherRow.find("td").eq(dayIndex).text().trim();

      let subject_code = "";
      let subject_name = "";

      if (lessonCode && lessonCode !== "-") {
        const match = /(\d+)([a-z]+)([a-z0-9]+)/i.exec(lessonCode);
        if (match) {
          subject_code = match[2].split("x")[0];

          const subjectMapping: Record<string, string> = {
            mat: "Matematika",
            tes: "Testnevelés",
            bio: "Biológia",
            foc: "Földrajz",
            an: "Angol nyelv",
            nyt: "Nyelvtan",
            ne: "Német nyelv",
            fiz: "Fizika",
            ofn: "Osztályfőnöki",
            ird: "Irodalom",
            zen: "Ének-zene",
            dig: "Digitális kultúra",
            kem: "Kémia",
            tor: "Történelem",
            rvk: "Dráma és színház",
          };

          subject_name = subjectMapping[subject_code] || subject_code;
        }
      }

      timetable[day][period as keyof TimetableDay] = {
        slot: day[0].toLowerCase() + String(period),
        code: lessonCode || "-",
        teacher: teacherName || "-",
        subject_code: subject_code || "-",
        subject_name: subject_name || "-",
      };
    });
  }

  const extendedTimetable = await extendTimetableWeekWithRooms(
    selfUser,
    timetable,
  );

  return extendedTimetable;
}

export async function GET(request: Request) {
  const studentCode = request.headers.get("ejg-code");
  const password = request.headers.get("password");

  if (!studentCode || !password) {
    return new Response(
      JSON.stringify({
        error: "Missing required headers: EJG_code or password",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  try {
    const timetable = await getTimetable(studentCode, password);

    if (!timetable) {
      return new Response(
        JSON.stringify({
          error: "Authentication failed or timetable not found",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    return new Response(JSON.stringify(timetable), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching timetable:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to fetch timetable",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
