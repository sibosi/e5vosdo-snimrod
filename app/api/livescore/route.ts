import { getMatches, Match } from "@/db/matches";
import { NextRequest, NextResponse } from "next/server";

export const config = {
  api: {
    bodyParser: false,
  },
};

interface SSEMatchGlobalState {
  gLivescoreSseSubscribers: Set<WritableStreamDefaultWriter<string>>;
  gLivescoreSseInterval: ReturnType<typeof setInterval> | null;
  gLivescoreLastMatchesData: Match[] | null;
}

const globalState = globalThis as unknown as Partial<SSEMatchGlobalState>;
globalState.gLivescoreSseSubscribers ??= new Set<
  WritableStreamDefaultWriter<string>
>();
if (globalState.gLivescoreSseInterval === undefined) {
  globalState.gLivescoreSseInterval = null;
}
if (globalState.gLivescoreLastMatchesData === undefined) {
  globalState.gLivescoreLastMatchesData = null;
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

globalState.gLivescoreSseInterval ??= setInterval(async () => {
  try {
    const matchData = await getMatches();

    // Find changes compared to last update
    const changes = findChanges(
      globalState.gLivescoreLastMatchesData,
      matchData,
    );

    // Only send updates if there are changes
    if (
      changes.changed.length > 0 ||
      changes.added.length > 0 ||
      changes.removed.length > 0
    ) {
      // Update stored data
      globalState.gLivescoreLastMatchesData = matchData;

      // Send only the changes
      const data = `data: ${JSON.stringify(changes)}\n\n`;
      const subscribers = globalState.gLivescoreSseSubscribers!;

      for (const writer of Array.from(subscribers)) {
        writer.write(data).catch((error) => {
          subscribers.delete(writer);
          console.error("Error sending SSE data:", error);
          writer.close().catch((closeError) => {
            console.error("Error closing writer:", closeError);
          });
        });
      }
    }
  } catch (error) {
    console.error("Error fetching match data:", error);
  }
}, 2000); // Check for updates every 2 seconds

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function GET(request: NextRequest) {
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  globalState.gLivescoreSseSubscribers!.add(writer);

  // Send connection established message
  writer.write(
    `data: ${JSON.stringify({ message: "Match score SSE connection established" })}\n\n`,
  );

  request.signal.addEventListener("abort", () => {
    globalState.gLivescoreSseSubscribers!.delete(writer);
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
