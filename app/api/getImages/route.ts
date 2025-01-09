import { NextResponse } from "next/server";
const fs = require("fs");
const path = require("path");

const availablePaths = [
  "/public/uploads/images",
  "/public/events",
  "/public/groups",
];

export async function GET() {
  let data: string[] = [];
  for (const availablePath of availablePaths) {
    const directory = path.join(process.cwd(), availablePath);
    const images = fs.readdirSync(directory);
    const imagePaths = images.map(
      (image: string) => `${availablePath.replace("/public", "")}/${image}`,
    );
    data = data.concat(imagePaths);
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const data = await request.json();
  return NextResponse.json({ data });
}
