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

let sendCapacityRunning = false;

async function sendCapacity(conditional = true) {
  if (sendCapacityRunning) return;
  sendCapacityRunning = true;

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database query timeout")), 10000),
    );

    const capacity = await Promise.race([
      getPresentationsCapacity(),
      timeoutPromise,
    ]).catch((e) => {
      console.error("Error in getPresentationsCapacity:", e);
      return null;
    });

    if (capacity === null) return;

    const capacityJson = JSON.stringify(capacity);
    if (
      conditional &&
      globalState.gSignupLastCapacity &&
      globalState.gSignupLastCapacity === capacityJson
    ) {
      return;
    }

    globalState.gSignupLastCapacity = capacityJson;
    const data = textEncoder.encode(`data: ${capacityJson}\n\n`);

    const subscribersArray = Array.from(globalState.gSignupSseSubscribers!);
    const writePromises = subscribersArray.map(async (writer) => {
      try {
        await writer.write(data);
      } catch (e) {
        globalState.gSignupSseSubscribers!.delete(writer);
        console.error("Error sending SSE data:", e);
        try {
          await writer.close();
        } catch (error_) {
          console.error("Error closing writer:", error_);
        }
      }
    });

    await Promise.race([
      Promise.allSettled(writePromises),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]);
  } finally {
    sendCapacityRunning = false;
  }
}

if (isTimerWorker) {
  globalState.gSignupPresentationsInterval ??= setInterval(sendCapacity, 2000);
  globalState.gSignupHeartbeatInterval ??= setInterval(
    () => sendCapacity(false),
    10000,
  );
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Cache-Control, Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function GET(request: NextRequest) {
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  globalState.gSignupSseSubscribers!.add(writer);

  const connectionsCount = globalState.gSignupSseSubscribers!.size;

  const initialMessage = `data: ${JSON.stringify({ message: "SSE connection established", connectionsCount })}\n\n`;
  const encodedInitialMessage = textEncoder.encode(initialMessage);

  writer.write(encodedInitialMessage).catch((error) => {
    console.error("Error sending initial SSE message:", error);
    globalState.gSignupSseSubscribers!.delete(writer);
    writer.close();
  });

  const cleanup = async () => {
    globalState.gSignupSseSubscribers!.delete(writer);
    try {
      await writer.close();
    } catch (error) {
      console.error("Error closing writer during cleanup:", error);
    }
  };

  request.signal.addEventListener("abort", cleanup);

  setTimeout(() => sendCapacity(false), 100);

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "X-Accel-Buffering": "no",
      // Force HTTP/1.1 to avoid HTTP/2 protocol errors with SSE
      "X-Content-Type-Options": "nosniff",
      // Disable HTTP/2 server push
      "X-Frame-Options": "DENY",
      // Add headers to prevent HTTP/2 issues
      "Keep-Alive": "timeout=30, max=100",
    },
  });
}
