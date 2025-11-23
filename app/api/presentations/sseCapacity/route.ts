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

async function sendCapacity(conditional = true) {
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database query timeout")), 5000),
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
        const writeTimeout = new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error("Client write timeout")), 3000),
        );

        await Promise.race([writer.write(data), writeTimeout]);
      } catch (e) {
        const isTimeoutError =
          e instanceof Error && e.message === "Client write timeout";
        console.error(
          `SSE write error (${isTimeoutError ? "timeout" : "other error"}):`,
          e,
        );

        globalState.gSignupSseSubscribers!.delete(writer);
        console.log(
          `Client removed. Active connections remaining: ${globalState.gSignupSseSubscribers!.size}`,
        );

        try {
          await writer.close();
        } catch (error_) {
          console.error("Error closing writer:", error_);
        }
      }
    });

    await Promise.allSettled(writePromises);
  } catch (error) {
    console.error("Unexpected error in sendCapacity:", error);
  }
}

if (isTimerWorker) {
  globalState.gSignupPresentationsInterval ??= setInterval(sendCapacity, 3000);
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
  console.log("New SSE connection request received");

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  globalState.gSignupSseSubscribers!.add(writer);

  const connectionsCount = globalState.gSignupSseSubscribers!.size;
  console.log(
    `New SSE connection established. Total active connections: ${connectionsCount}`,
  );

  const initialMessage = `data: ${JSON.stringify({ message: "SSE connection established", connectionsCount })}\n\n`;
  const encodedInitialMessage = textEncoder.encode(initialMessage);

  writer.write(encodedInitialMessage).catch((error) => {
    console.error("Error sending initial SSE message:", error);
    globalState.gSignupSseSubscribers!.delete(writer);
    writer.close();
  });

  const cleanup = async () => {
    const subscriberCount = globalState.gSignupSseSubscribers!.size;
    console.log(
      `SSE connection cleanup. Active connections before: ${subscriberCount}`,
    );

    globalState.gSignupSseSubscribers!.delete(writer);
    try {
      await writer.close();
    } catch (error) {
      console.error("Error closing writer during cleanup:", error);
    }

    console.log(
      `SSE connection closed. Active connections after: ${globalState.gSignupSseSubscribers!.size}`,
    );
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
