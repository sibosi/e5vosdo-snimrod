import { getMatches, Match } from "@/db/matches";
import { NextRequest, NextResponse } from "next/server";

export const config = {
  api: {
    bodyParser: false,
  },
};

interface SSEMatchGlobalState {
  sseSubscribers: Set<WritableStreamDefaultWriter<string>>;
  sseInterval: ReturnType<typeof setInterval> | null;
  lastMatchesData: Match[] | null;
}

const globalState = globalThis as unknown as Partial<SSEMatchGlobalState>;
if (!globalState.sseSubscribers) {
  globalState.sseSubscribers = new Set<WritableStreamDefaultWriter<string>>();
}
if (globalState.sseInterval === undefined) {
  globalState.sseInterval = null;
}
if (globalState.lastMatchesData === undefined) {
  globalState.lastMatchesData = null;
}

if (!globalState.sseInterval) {
  globalState.sseInterval = setInterval(async () => {
    try {
      const matchData = await getMatches();

      if (
        !globalState.lastMatchesData ||
        JSON.stringify(globalState.lastMatchesData) !== JSON.stringify(matchData)
      ) {
        globalState.lastMatchesData = matchData;
        const data = `data: ${JSON.stringify(matchData)}\n\n`;
        const subscribers = globalState.sseSubscribers!;
        for (const writer of Array.from(subscribers)) {
          try {
            writer.write(data);
          } catch (error) {
            globalState.sseSubscribers!.delete(writer);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching match data:", error);
    }
  }, 2000); // Check for updates every 2 seconds
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function GET(request: NextRequest) {
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  globalState.sseSubscribers!.add(writer);

  writer.write(
    `data: ${JSON.stringify({ message: "Match score SSE connection established" })}\n\n`,
  );

  request.signal.addEventListener("abort", () => {
    globalState.sseSubscribers!.delete(writer);
    writer.close();
  });

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}