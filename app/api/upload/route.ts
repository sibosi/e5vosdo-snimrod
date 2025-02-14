import { NextRequest, NextResponse } from "next/server";
import { addLog, getAuth } from "@/db/dbreq";
import { uploadImage } from "@/db/supabaseStorage";
import sharp from "sharp";

async function compressImage(
  buffer: Buffer,
): Promise<{ data: Buffer; info: sharp.OutputInfo }> {
  let quality = 80;
  let { data, info } = await sharp(buffer)
    .jpeg({ quality })
    .toBuffer({ resolveWithObject: true });

  while (data.length > 1024 * 1024 && quality > 30) {
    quality -= 10;
    const result = await sharp(buffer)
      .jpeg({ quality })
      .toBuffer({ resolveWithObject: true });
    data = result.data;
    info = result.info;
  }

  return { data, info };
}

export async function POST(req: NextRequest) {
  const selfUser = await getAuth();
  if (!selfUser)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  addLog("upload", selfUser.email);

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

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { data: compressedData, info } = await compressImage(fileBuffer);

    if (compressedData.length > 1024 * 1024) {
      return NextResponse.json(
        {
          message:
            "Compressed image is larger than 1MB, please try another image",
        },
        { status: 400 },
      );
    }

    const compressedFile = new File([compressedData], file.name, {
      type: info.format,
    });

    return uploadImage(compressedFile, "uploads", directory);
  } catch (error) {
    console.error("Error while uploading file:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ message: "Unsupported method" }, { status: 405 });
}
