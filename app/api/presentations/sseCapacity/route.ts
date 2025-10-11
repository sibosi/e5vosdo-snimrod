import { getPresentationsCapacity } from "@/db/presentationSignup";
import { NextRequest } from "next/server";

export const config = {
  api: {
    bodyParser: false,
  },
};

interface SSEGlobalState {
  sseSubscribers: Set<WritableStreamDefaultWriter<Uint8Array>>;
  sseInterval: ReturnType<typeof setInterval> | null;
  heartbeatInterval: ReturnType<typeof setInterval> | null;
  lastCapacity: unknown;
}

const globalState = globalThis as unknown as Partial<SSEGlobalState>;
globalState.sseSubscribers ??= new Set<
  WritableStreamDefaultWriter<Uint8Array>
>();
if (globalState.sseInterval === undefined) globalState.sseInterval = null;
if (globalState.heartbeatInterval === undefined)
  globalState.heartbeatInterval = null;
if (globalState.lastCapacity === undefined) globalState.lastCapacity = null;

const textEncoder = new TextEncoder();

globalState.heartbeatInterval ??= setInterval(() => {
  console.log("Sending heartbeat to SSE clients");
  const heartbeat = textEncoder.encode(": heartbeat\n\n");
  const subscribers = globalState.sseSubscribers!;
  const subscribersArray = Array.from(subscribers);

  for (const writer of subscribersArray) {
    writer.write(heartbeat).catch((e) => {
      globalState.sseSubscribers!.delete(writer);
      console.log("Removed disconnected client during heartbeat");
    });
  }
}, 30000);

globalState.sseInterval ??= setInterval(async () => {
  console.log("SSE interval fetched capacity:");

  const capacity = await getPresentationsCapacity().catch((e) => {
    console.error("Error in getPresentationsCapacity:", e);
  });

  if (
    globalState.lastCapacity &&
    JSON.stringify(globalState.lastCapacity) === JSON.stringify(capacity)
  ) {
    return;
  }

  globalState.lastCapacity = capacity;
  const data = textEncoder.encode(`data: ${JSON.stringify(capacity)}\n\n`);
  const subscribersArray = Array.from(globalState.sseSubscribers!);

  for (const writer of subscribersArray) {
    writer.write(data).catch((e) => {
      globalState.sseSubscribers!.delete(writer);
      console.error("Error sending SSE data:", e);
      console.log(
        "Removed a disconnected SSE client. Current subscribers:",
        globalState.sseSubscribers!.size,
      );
      writer.close().catch((closeError) => {
        console.error("Error closing writer:", closeError);
      });
    });
  }
}, 2000);

export async function GET(request: NextRequest) {
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  globalState.sseSubscribers!.add(writer);

  const m2 = ", subscribers count: " + globalState.sseSubscribers!.size;
  const m3 =
    ", SSE interval: " + (globalState.sseInterval ? "active" : "inactive");

  const initialMessage = `data: ${JSON.stringify({ message: "SSE connection established" + m2 + m3 })}\n\n`;
  const encodedInitialMessage = textEncoder.encode(initialMessage);

  writer.write(encodedInitialMessage).catch((error) => {
    console.error("Error sending initial SSE message:", error);
    globalState.sseSubscribers!.delete(writer);
    writer.close();
  });

  const cleanup = async () => {
    globalState.sseSubscribers!.delete(writer);
    writer.close().catch((error) => {
      console.error("Error closing writer:", error);
    });
    console.log(
      "A client disconnected. Current subscribers:",
      globalState.sseSubscribers!.size,
    );
  };

  request.signal.addEventListener("abort", cleanup);

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
      "X-Accel-Buffering": "no",
      "Transfer-Encoding": "chunked",
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
}
