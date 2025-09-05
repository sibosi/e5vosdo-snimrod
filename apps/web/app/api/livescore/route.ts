import { getMatches, Match } from "@/apps/web/db/matches";
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

// Helper function to find changes between old and new match data
function findChanges(
  oldMatches: Match[] | null | undefined,
  newMatches: Match[],
): {
  changed: Match[];
  added: Match[];
  removed: number[];
} {
  const changes = {
    changed: [] as Match[],
    added: [] as Match[],
    removed: [] as number[],
  };

  if (!oldMatches) {
    // First time, all matches are new
    return {
      changed: [],
      added: newMatches,
      removed: [],
    };
  }

  // Create maps for efficient lookup
  const oldMatchMap = new Map(oldMatches.map((match) => [match.id, match]));
  const newMatchMap = new Map(newMatches.map((match) => [match.id, match]));

  // Find added and changed matches
  for (const match of newMatches) {
    const oldMatch = oldMatchMap.get(match.id);

    if (!oldMatch) {
      // New match
      changes.added.push(match);
    } else if (JSON.stringify(oldMatch) !== JSON.stringify(match)) {
      // Changed match
      changes.changed.push(match);
    }
  }

  // Find removed matches
  for (const oldMatch of oldMatches) {
    if (!newMatchMap.has(oldMatch.id)) {
      changes.removed.push(oldMatch.id);
    }
  }

  return changes;
}

if (!globalState.sseInterval) {
  globalState.sseInterval = setInterval(async () => {
    try {
      const matchData = await getMatches();

      // Find changes compared to last update
      const changes = findChanges(globalState.lastMatchesData, matchData);

      // Only send updates if there are changes
      if (
        changes.changed.length > 0 ||
        changes.added.length > 0 ||
        changes.removed.length > 0
      ) {
        // Update stored data
        globalState.lastMatchesData = matchData;

        // Send only the changes
        const data = `data: ${JSON.stringify(changes)}\n\n`;
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

  // Send connection established message
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
