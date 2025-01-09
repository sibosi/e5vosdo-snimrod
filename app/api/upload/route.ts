import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises"; // FS module for saving files
import { join } from "path"; // To handle paths
import { getAuth } from "@/db/dbreq";

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

    const uploadPath = join(process.cwd(), "/public/uploads/", directory);
    await mkdir(uploadPath, { recursive: true });
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const filePath = join(uploadPath, file.name);

    await writeFile(filePath, new Uint8Array(fileBuffer));
    return NextResponse.json({
      message: "File uploaded successfully",
      file: file.name,
    });
  } catch (error) {
    console.error("Error while uploading file:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ message: "Unsupported method" }, { status: 405 });
}
