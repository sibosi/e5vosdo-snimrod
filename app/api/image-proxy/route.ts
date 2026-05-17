import { NextResponse } from "next/server";

import {
  buildImageProxyConfig,
  ProxyError,
  validateUrl,
} from "@/lib/imageProxySecurity";

export const runtime = "nodejs";

const config = buildImageProxyConfig();

async function readResponseWithLimit(response: Response, limit: number) {
  if (!response.body) {
    throw new ProxyError("Empty response body", 502);
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    total += value.length;
    if (total > limit) {
      await reader.cancel();
      throw new ProxyError("Image too large", 413);
    }
    chunks.push(value);
  }

  return Buffer.concat(chunks, total);
}

async function fetchWithValidation(initialUrl: URL) {
  let currentUrl = initialUrl;

  for (
    let redirectCount = 0;
    redirectCount <= config.maxRedirects;
    redirectCount++
  ) {
    await validateUrl(currentUrl, { allowedHosts: config.allowedHosts });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

    let response: Response;
    try {
      response = await fetch(currentUrl.toString(), {
        redirect: "manual",
        signal: controller.signal,
      });
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        throw new ProxyError("Upstream request timed out", 504);
      }
      throw new ProxyError("Failed to fetch image", 502);
    } finally {
      clearTimeout(timeoutId);
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) {
        throw new ProxyError("Redirect without location", 502);
      }
      currentUrl = new URL(location, currentUrl);
      continue;
    }

    return response;
  }

  throw new ProxyError("Too many redirects", 508);
}

function buildCorsHeaders(request: Request) {
  const headers = new Headers();
  const requestOrigin = request.headers.get("origin");
  const allowedOrigins = new Set(config.allowedOrigins);
  allowedOrigins.add(new URL(request.url).origin);

  if (requestOrigin && allowedOrigins.has(requestOrigin)) {
    headers.set("Access-Control-Allow-Origin", requestOrigin);
    headers.set("Vary", "Origin");
  }

  return headers;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");
  const responseHeaders = buildCorsHeaders(request);

  if (!imageUrl) {
    return new NextResponse("Missing URL parameter", {
      status: 400,
      headers: responseHeaders,
    });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(imageUrl);
  } catch {
    return new NextResponse("Invalid URL", {
      status: 400,
      headers: responseHeaders,
    });
  }

  try {
    const response = await fetchWithValidation(targetUrl);
    if (!response.ok) {
      return new NextResponse("Failed to fetch image", {
        status: response.status,
        headers: responseHeaders,
      });
    }

    const contentType = response.headers.get("content-type") ?? "image/jpeg";
    if (!contentType.startsWith("image/")) {
      return new NextResponse("Unsupported content type", {
        status: 415,
        headers: responseHeaders,
      });
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength && Number(contentLength) > config.maxImageBytes) {
      return new NextResponse("Image too large", {
        status: 413,
        headers: responseHeaders,
      });
    }

    const buffer = await readResponseWithLimit(response, config.maxImageBytes);
    responseHeaders.set("Content-Type", contentType);
    responseHeaders.set("Content-Length", buffer.length.toString());

    return new NextResponse(buffer, {
      headers: responseHeaders,
    });
  } catch (error) {
    if (error instanceof ProxyError) {
      return new NextResponse(error.message, {
        status: error.status,
        headers: responseHeaders,
      });
    }

    return new NextResponse("Failed to fetch image", {
      status: 500,
      headers: responseHeaders,
    });
  }
}
