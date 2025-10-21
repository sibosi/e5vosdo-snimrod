import { NextRequest, NextResponse } from "next/server";
import { resolve } from "path";
import { promises as fs } from "fs";

export async function GET(req: NextRequest) {
  const filePath = resolve("./public/programok.pdf");
  const fileBuffer = await fs.readFile(filePath);

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="sample.pdf"',
    },
  });
}
