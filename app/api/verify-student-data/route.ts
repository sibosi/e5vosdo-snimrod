import { verifyAndSaveStudentData } from "@/db/dbreq";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await verifyAndSaveStudentData(
      typeof body.EJG_code === "string" ? body.EJG_code : "",
      typeof body.OM5 === "string" ? body.OM5 : "",
    );
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    console.error("Error verifying student data:", error);
    return NextResponse.json(
      { ok: false, error: "Az adatok ellenőrzése sikertelen." },
      { status: 500 },
    );
  }
}
