import { getPresentationsCapacity } from "@/db/presentationSignup";
import { NextRequest } from "next/server";

export const config = {
  api: {
    bodyParser: false,
  },
};

interface SSEGlobalState {
  sseSubscribers: Set<WritableStreamDefaultWriter<string>>;
  sseInterval: ReturnType<typeof setInterval> | null;
  lastCapacity: unknown;
}

const globalState = globalThis as unknown as Partial<SSEGlobalState>;
globalState.sseSubscribers ??= new Set<WritableStreamDefaultWriter<string>>();
if (globalState.sseInterval === undefined) globalState.sseInterval = null;
if (globalState.lastCapacity === undefined) globalState.lastCapacity = null;

globalState.sseInterval ??= setInterval(async () => {
  try {
    const capacity = await getPresentationsCapacity();

    if (
      !globalState.lastCapacity ||
      JSON.stringify(globalState.lastCapacity) !== JSON.stringify(capacity)
    ) {
      globalState.lastCapacity = capacity;
      const data = `data: ${JSON.stringify(capacity)}\n\n`;
      const subscribers = globalState.sseSubscribers!;
      for (const writer of Array.from(subscribers)) {
        writer.write(data).catch(() => {
          globalState.sseSubscribers!.delete(writer);
        });
      }
    }
  } catch (error) {
    console.error("Error fetching capacity:", error);
  }
}, 2000);

export async function GET(request: NextRequest) {
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  globalState.sseSubscribers!.add(writer);

  writer.write(
    `data: ${JSON.stringify({ message: "SSE connection established, subscribers count: " + globalState.sseSubscribers!.size })}\n\n`,
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
