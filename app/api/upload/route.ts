import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises"; // FS module for saving files
import { join } from "path"; // To handle paths
import { getAuth } from "@/db/dbreq";

export async function POST(req: NextRequest) {
  const selfUser = await getAuth();
  console.log(selfUser?.email + " tried to upload a file");
  if (selfUser?.permissions.includes("admin") === false)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const directory = formData.get("directory") as string;

    console.log("Fájl neve: ", file.name);

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 },
      );
    }

    console.log("Fájl mérete: ", file.size);

    // Define the path where to save the file
    const filePath = join(
      process.cwd(),
      "/public/uploads/" + directory,
      file.name,
    );

    console.log("Fájl mentési helye: ", filePath);

    // Create the directory if it doesn't exist
    await mkdir(join(process.cwd(), "/public/uploads/" + directory), {
      recursive: true,
    });

    console.log("Mappa létrehozva: ", directory);

    // Convert the file data to ArrayBuffer to save it
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    console.log("Fájl buffer: ", fileBuffer);

    // Save the file to the designated path
    await writeFile(filePath, fileBuffer);

    console.log("Feltöltött fájl: ", file.name);

    return NextResponse.json({
      message: "File uploaded successfully",
      file: file.name,
    });
  } catch (error) {
    console.error("Error while uploading file: ", error);
    return NextResponse.json(
      { message: "Error while uploading file" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ message: "Unsupported method" }, { status: 405 });
}
