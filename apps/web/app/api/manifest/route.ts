import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export async function GET() {
  const manifestPath = path.join(process.cwd(), "public", "manifest.json");
  const fileContent = await fs.readFile(manifestPath, "utf8");
  const manifestData = JSON.parse(fileContent);

  return NextResponse.json(manifestData);
}
