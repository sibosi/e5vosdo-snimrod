import { getAuth } from "@/db/dbreq";
import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

const DIRNAME = path.join(process.cwd(), "podcasts");

export async function GET() {
  const selfUser = getAuth();
  const podcasts = await fs.promises.readdir(DIRNAME);
  return NextResponse.json(podcasts);
}
