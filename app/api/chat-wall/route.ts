import { getAuth } from "@/db/dbreq";
import { createChatWallMessage, getChatWallMessages } from "@/lib/chat_wall";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    if (!(await getAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(await getChatWallMessages());
  } catch (error) {
    console.error("Failed to load chat wall:", error);
    return NextResponse.json(
      { error: "Failed to load messages" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const content = typeof body.content === "string" ? body.content : "";
    const parentId = body.parentId == null ? null : Number(body.parentId);
    const mentionedEmails = Array.isArray(body.mentionedEmails)
      ? body.mentionedEmails.filter(
          (email: unknown): email is string => typeof email === "string",
        )
      : [];

    if (parentId !== null && (!Number.isInteger(parentId) || parentId < 1)) {
      return NextResponse.json(
        { error: "Invalid parent message" },
        { status: 400 },
      );
    }

    await createChatWallMessage(content, parentId, mentionedEmails);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (
      error instanceof Error &&
      (error.message.includes("between") || error.message.includes("not found"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Failed to create chat wall message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 },
    );
  }
}
