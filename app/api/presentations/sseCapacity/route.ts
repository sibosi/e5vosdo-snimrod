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
const workerTag = `W${workerId || "solo"}#${process.pid}`;

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
          `SSE write error (${isTimeoutError ? "timeout" : "other error"}) [${workerTag}]:`,
          e,
        );

        globalState.gSignupSseSubscribers!.delete(writer);
        console.log(
          `Client removed. Active connections remaining [${workerTag}]: ${globalState.gSignupSseSubscribers!.size}`,
        );

        try {
          await writer.close();
        } catch (error_) {
          console.error(`Error closing writer [${workerTag}]:`, error_);
        }
      }
    });

    await Promise.allSettled(writePromises);
  } catch (error) {
    console.error(`Unexpected error in sendCapacity [${workerTag}]:`, error);
  }
}

// Lightweight heartbeat that doesn't hit the DB; runs on ALL workers to keep connections alive
async function sendHeartbeat() {
  try {
    if (
      !globalState.gSignupSseSubscribers ||
      globalState.gSignupSseSubscribers.size === 0
    )
      return;
    const ts = Date.now();
    const data = textEncoder.encode(`: heartbeat ${workerTag} ${ts}\n\n`);
    const subscribersArray = Array.from(globalState.gSignupSseSubscribers);
    for (const writer of subscribersArray) {
      try {
        const writeTimeout = new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error("Client write timeout")), 2000),
        );
        await Promise.race([writer.write(data), writeTimeout]);
      } catch (e) {
        const isTimeoutError =
          e instanceof Error && e.message === "Client write timeout";
        console.warn(
          `Heartbeat write error (${isTimeoutError ? "timeout" : "other error"}) [${workerTag}]`,
          e,
        );
        globalState.gSignupSseSubscribers.delete(writer);
        try {
          await writer.close();
        } catch {
          /* noop */
        }
      }
    }
  } catch (e) {
    console.error(`Unexpected error in sendHeartbeat [${workerTag}]:`, e);
  }
}

// Only one worker should query DB and push capacities periodically
if (isTimerWorker) {
  globalState.gSignupPresentationsInterval ??= setInterval(sendCapacity, 3000);
}
// Heartbeat should run on every worker to prevent idle disconnects
globalState.gSignupHeartbeatInterval ??= setInterval(sendHeartbeat, 15000);

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
  console.log(`New SSE connection request received [${workerTag}]`);

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  globalState.gSignupSseSubscribers!.add(writer);

  const connectionsCount = globalState.gSignupSseSubscribers!.size;
  console.log(
    `New SSE connection established. Total active connections [${workerTag}]: ${connectionsCount}`,
  );

  const initialMessage = `data: ${JSON.stringify({ message: "SSE connection established", connectionsCount })}\n\n`;
  const encodedInitialMessage = textEncoder.encode(initialMessage);

  writer.write(encodedInitialMessage).catch((error) => {
    console.error(`Error sending initial SSE message [${workerTag}]:`, error);
    globalState.gSignupSseSubscribers!.delete(writer);
    writer.close();
  });

  let cleanedUp = false;
  const cleanup = async () => {
    if (cleanedUp) return;
    cleanedUp = true;
    const subscriberCount = globalState.gSignupSseSubscribers!.size;
    console.log(
      `SSE connection cleanup [${workerTag}]. Active connections before: ${subscriberCount}`,
    );

    globalState.gSignupSseSubscribers!.delete(writer);
    try {
      await writer.close();
    } catch (error) {
      console.error(
        `Error closing writer during cleanup [${workerTag}]:`,
        error,
      );
    }

    console.log(
      `SSE connection closed [${workerTag}]. Active connections after: ${globalState.gSignupSseSubscribers!.size}`,
    );
  };

  request.signal.addEventListener("abort", cleanup);

  // Kick off a quick heartbeat to ensure proxies see traffic soon after connect
  setTimeout(() => {
    try {
      const bootMsg = textEncoder.encode(
        `: handshake ${workerTag} ${Date.now()}\n\n`,
      );
      writer.write(bootMsg).catch(() => {
        /* noop */
      });
    } catch {
      /* noop */
    }
  }, 100);

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
      "X-Worker-Id": workerTag,
    },
  });
}
