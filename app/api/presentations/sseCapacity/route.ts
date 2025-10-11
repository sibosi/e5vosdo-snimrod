import { getPresentationsCapacity } from "@/db/presentationSignup";
import { NextRequest } from "next/server";

export const config = {
  api: {
    bodyParser: false,
  },
};

interface SSEGlobalState {
  gSignupSseSubscribers: Set<WritableStreamDefaultWriter<Uint8Array>>;
  gSignupPresentationsInterval: ReturnType<typeof setInterval> | null;
  gSignupHeartbeatInterval: ReturnType<typeof setInterval> | null;
  gSignupLastCapacity: unknown;
}

const globalState = globalThis as unknown as Partial<SSEGlobalState>;
globalState.gSignupSseSubscribers ??= new Set<
  WritableStreamDefaultWriter<Uint8Array>
>();
if (globalState.gSignupPresentationsInterval === undefined)
  globalState.gSignupPresentationsInterval = null;
if (globalState.gSignupHeartbeatInterval === undefined)
  globalState.gSignupHeartbeatInterval = null;
if (globalState.gSignupLastCapacity === undefined)
  globalState.gSignupLastCapacity = null;

const textEncoder = new TextEncoder();

const workerId = process.env.WORKER_ID;
const isTimerWorker = workerId === "1" || !workerId;

console.log(
  `Worker ${workerId || "standalone"} (PID: ${process.pid}) - Timer initialization: ${isTimerWorker ? "YES" : "NO"}`,
);

async function sendHeartbeat() {
  const data = textEncoder.encode(`data: heartbeat\n\n`);
  const subscribersArray = Array.from(globalState.gSignupSseSubscribers!);

  for (const writer of subscribersArray) {
    writer.write(data).catch((e) => {
      globalState.gSignupSseSubscribers!.delete(writer);
      console.error("Error sending SSE heartbeat:", e);
      writer.close().catch((closeError) => {
        console.error("Error closing writer:", closeError);
      });
    });
  }
}

async function sendCapacity() {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Database query timeout")), 10000),
  );

  const capacity = await Promise.race([
    getPresentationsCapacity(),
    timeoutPromise,
  ]).catch((e) => {
    console.error("Error in getPresentationsCapacity:", e);
    console.error("Error stack:", e.stack);
    console.error("Error name:", e.name);
    console.error("Error message:", e.message);
    return null;
  });

  if (capacity === null) return;

  if (
    globalState.gSignupLastCapacity &&
    JSON.stringify(globalState.gSignupLastCapacity) === JSON.stringify(capacity)
  )
    return;

  globalState.gSignupLastCapacity = capacity;
  const data = textEncoder.encode(`data: ${JSON.stringify(capacity)}\n\n`);
  const subscribersArray = Array.from(globalState.gSignupSseSubscribers!);

  for (const writer of subscribersArray) {
    writer.write(data).catch((e) => {
      globalState.gSignupSseSubscribers!.delete(writer);
      console.error("Error sending SSE data:", e);
      writer.close().catch((closeError) => {
        console.error("Error closing writer:", closeError);
      });
    });
  }
}

if (isTimerWorker) {
  globalState.gSignupHeartbeatInterval ??= setInterval(sendHeartbeat, 30000);
  globalState.gSignupPresentationsInterval ??= setInterval(sendCapacity, 2000);
}

export async function GET(request: NextRequest) {
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  globalState.gSignupSseSubscribers!.add(writer);

  const initialMessage = `data: ${JSON.stringify({ message: "SSE connection established" })}\n\n`;
  const encodedInitialMessage = textEncoder.encode(initialMessage);

  writer.write(encodedInitialMessage).catch((error) => {
    console.error("Error sending initial SSE message:", error);
    globalState.gSignupSseSubscribers!.delete(writer);
    writer.close();
  });

  const cleanup = async () => {
    globalState.gSignupSseSubscribers!.delete(writer);
    writer.close().catch((error) => {
      console.error("Error closing writer:", error);
    });
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
