import menuJSON from "@/public/storage/mindenkorimenu.json";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(menuJSON);
}
