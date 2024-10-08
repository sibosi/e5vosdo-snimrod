import { NextResponse } from "next/server";

const ISKOLA = "Budapest V. Kerületi Eötvös József Gimnázium";
const URL = "https://backend.milliolepes.hu/api/v2/comp/7/board/fullorg"; // gives a JSON with all the data

export interface SchoolData {
  rank: number;
  id: number;
  name: string;
  points: number;
  region: string;
  settlement: string;
  headcount: number;
  laps: string;
}

export interface MillioLepesAPIResponse {
  worseSchool: SchoolData;
  school: SchoolData;
  betterShool: SchoolData;
  timestamp: string;
}

let cachedData: MillioLepesAPIResponse | null = null;
let lastUpdated: number | null = null;
const CACHE_DURATION = 1000 * 60 * 60 * 1; // 1 hour

async function update() {
  console.log("Updating the table...");
  console.log(new Date().toISOString());

  const data = (await fetch(URL).then((res) => res.json())) as {
    board: SchoolData[];
    timestamp: string;
  };
  console.log("Data fetched");

  const { board } = data;

  const school = board.find((d) => d.name === ISKOLA);

  if (!school) {
    console.error("School not found in the board");
    return null;
  }
  // by rank
  const betterShool = board.filter((d) => d.rank == school.rank - 1);
  const worseSchool = board.filter((d) => d.rank == school.rank + 1);

  console.log("Data processed");
  return {
    worseSchool: worseSchool[0],
    school,
    betterShool: betterShool[0],
    timestamp: data.timestamp,
  };
}

export async function GET() {
  if (
    !cachedData ||
    (lastUpdated && Date.now() - lastUpdated > CACHE_DURATION)
  ) {
    cachedData = await update();
    lastUpdated = Date.now();
  }

  return NextResponse.json(cachedData);
}
