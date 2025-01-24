import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/db/dbreq";
import uploadImage from "@/db/uploadToSupabase";

export async function POST(req: NextRequest) {
  const selfUser = await getAuth();
  if (!selfUser)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const directory = selfUser.permissions.includes("admin")
      ? (formData.get("directory") as string)?.trim()
      : "unchecked";

    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 },
      );
    }
    if (!directory) {
      return NextResponse.json(
        { message: "No directory provided" },
        { status: 400 },
      );
    }

    const response = uploadImage(file, "uploads", `${directory}/${file.name}`);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error while uploading file:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ message: "Unsupported method" }, { status: 405 });
}
