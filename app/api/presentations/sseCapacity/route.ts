import { getPresentationsRealtimeData } from "@/db/presentationSignup";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Client = ReadableStreamDefaultController<Uint8Array>;

interface SseState {
  clients: Set<Client>;
  dataTimer: ReturnType<typeof setInterval> | null;
  heartbeatTimer: ReturnType<typeof setInterval> | null;
  lastJson: string | null;
  lastFetchAt: number;
  inFlight: boolean;
}

const g = globalThis as unknown as {
  __signupSse?: SseState;
};

const state = (g.__signupSse ??= {
  clients: new Set<Client>(),
  dataTimer: null,
  heartbeatTimer: null,
  lastJson: null,
  lastFetchAt: 0,
  inFlight: false,
});

const encoder = new TextEncoder();

function removeClient(client: Client, close = true) {
  state.clients.delete(client);

  if (close) {
    try {
      client.close();
    } catch {
      // Already closed or cancelled.
    }
  }

  if (state.clients.size === 0) {
    stopTimers();
  }
}

function send(client: Client, message: string) {
  try {
    const desired = client.desiredSize;

    // Avoid accumulating messages for slow clients.
    if (desired === null || desired <= -2) {
      removeClient(client);
      return;
    }

    client.enqueue(encoder.encode(message));
  } catch {
    removeClient(client);
  }
}

function broadcast(message: string) {
  for (const client of state.clients) {
    send(client, message);
  }
}

async function refreshCapacity() {
  if (state.inFlight || state.clients.size === 0) {
    return;
  }

  state.inFlight = true;

  try {
    const capacity = await getPresentationsRealtimeData();

    if (capacity == null) {
      throw new Error("Capacity query returned null");
    }

    const json = JSON.stringify(capacity);

    // The query completed successfully.
    state.lastFetchAt = Date.now();

    // Broadcast only if something changed.
    if (json !== state.lastJson) {
      state.lastJson = json;
      broadcast(`data: ${json}\n\n`);
    }
  } catch (error) {
    console.error("[SSE] Capacity refresh failed:", error);

    // Keep the existing connections alive.
    // The next successful query will update the cache.
  } finally {
    state.inFlight = false;
  }
}

function startTimers() {
  if (state.dataTimer === null) {
    state.dataTimer = setInterval(() => {
      void refreshCapacity();
    }, 3000);
  }

  if (state.heartbeatTimer === null) {
    state.heartbeatTimer = setInterval(() => {
      broadcast("event: ping\ndata: 1\n\n");
    }, 10000);
  }
}

function stopTimers() {
  if (state.dataTimer !== null) {
    clearInterval(state.dataTimer);
    state.dataTimer = null;
  }

  if (state.heartbeatTimer !== null) {
    clearInterval(state.heartbeatTimer);
    state.heartbeatTimer = null;
  }
}

export async function GET(request: NextRequest) {
  let controllerRef: Client | null = null;
  let cleanedUp = false;

  const cleanup = (cancelled = false) => {
    if (cleanedUp) return;

    cleanedUp = true;

    request.signal.removeEventListener("abort", onAbort);

    if (controllerRef) {
      removeClient(controllerRef, !cancelled);
      controllerRef = null;
    }
  };

  const onAbort = () => cleanup();

  const stream = new ReadableStream<Uint8Array>(
    {
      start(controller) {
        controllerRef = controller;

        state.clients.add(controller);

        // Tell the browser how long to wait before retrying.
        send(controller, "retry: 3000\n\n");

        // Initial connection event.
        send(controller, "event: connected\ndata: 1\n\n");

        // Send cached capacity only to the new client.
        if (state.lastJson !== null) {
          send(controller, `data: ${state.lastJson}\n\n`);
        }

        startTimers();

        // On first connection, or if cached data is old,
        // refresh once. inFlight prevents simultaneous queries.
        if (state.lastJson === null || Date.now() - state.lastFetchAt > 3000) {
          void refreshCapacity();
        }
      },

      cancel() {
        cleanup(true);
      },
    },
    {
      highWaterMark: 2,
      size: () => 1,
    },
  );

  request.signal.addEventListener("abort", onAbort, {
    once: true,
  });

  if (request.signal.aborted) {
    cleanup();
  }

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
