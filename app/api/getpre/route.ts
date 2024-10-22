import { getAuth, getMyPresentetions, signUpForPresentation } from "@/db/dbreq";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const response = await getMyPresentetions();

  return NextResponse.json(response, { status: 200 });
}
