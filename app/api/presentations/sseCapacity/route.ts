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
    console.log("SSE interval fetched capacity:");

    if (
      !globalState.lastCapacity ||
      JSON.stringify(globalState.lastCapacity) !== JSON.stringify(capacity)
    ) {
      globalState.lastCapacity = capacity;
      const data = `data: ${JSON.stringify(capacity)}\n\n`;
      const subscribers = globalState.sseSubscribers!;
      for (const writer of Array.from(subscribers)) {
        writer.write(data).catch((e) => {
          globalState.sseSubscribers!.delete(writer);
          console.error("Error sending SSE data:", e);
          console.log(
            "Removed a disconnected SSE client. Current subscribers:",
            globalState.sseSubscribers!.size,
          );
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

  const m2 = ", subscribers count: " + globalState.sseSubscribers!.size;
  const m3 =
    ", SSE interval: " + (globalState.sseInterval ? "active" : "inactive");

  writer.write(
    `data: ${JSON.stringify({ message: "SSE connection established" + m2 + m3 })}\n\n`,
  );

  request.signal.addEventListener("abort", () => {
    globalState.sseSubscribers!.delete(writer);
    writer.close();
    console.log(
      "A client aborted the connection. Current subscribers:",
      globalState.sseSubscribers!.size,
    );
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
