import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new NextResponse("Missing URL parameter", { status: 400 });
  }

  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    return new NextResponse(blob, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new NextResponse("Failed to fetch image", { status: 500 });
  }
}
