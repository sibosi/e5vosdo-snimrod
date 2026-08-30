export default async function proxyFetch(
  input: string | Request | URL,
  init?: RequestInit,
): Promise<Response> {
  const PROXY_URL = process.env.PROXY_URL;
  if (!PROXY_URL) return fetch(input, init);

  const PROXY_TOKEN = process.env.PROXY_TOKEN;
  if (!PROXY_TOKEN) {
    throw new Error("PROXY_URL is set but PROXY_TOKEN is missing; set PROXY_TOKEN to enable proxying");
  }

  let targetUrl: string;
  let method = init?.method;
  let body = init?.body;
  const headers = new Headers(init?.headers);

  if (typeof input === "string" || input instanceof URL) {
    targetUrl = input.toString();
  } else {
    targetUrl = input.url;
    method = method ?? input.method;
    input.headers.forEach((value, key) => {
      if (!headers.has(key)) headers.set(key, value);
    });
    if (body === undefined && input.body) {
      body = await input.clone().arrayBuffer();
    }
  }

  const originalAuth = headers.get("Authorization");
  if (originalAuth) {
    headers.set("X-Target-Authorization", originalAuth);
  }
  headers.set("Authorization", `Bearer ${PROXY_TOKEN}`);

  const proxyRequestUrl = new URL(PROXY_URL);
  proxyRequestUrl.searchParams.set("url", targetUrl);

  return fetch(proxyRequestUrl.toString(), {
    ...init,
    method,
    headers,
    body,
  });
}
