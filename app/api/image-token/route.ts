import { getAuth } from "@/db/dbreq";
import { NextResponse } from "next/server";
import { generateImageToken } from "@/db/imageAuth";

export async function GET() {
  const selfUser = await getAuth();

  if (!selfUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = generateImageToken(selfUser.email);

  return NextResponse.json({ token });
}
