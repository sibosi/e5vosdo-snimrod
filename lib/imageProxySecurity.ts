import dns from "node:dns/promises";
import type { LookupAddress, LookupAllOptions } from "node:dns";
import net from "node:net";

export type ImageProxyConfig = {
  allowedHosts: string[];
  allowedOrigins: string[];
  timeoutMs: number;
  maxImageBytes: number;
  maxRedirects: number;
};

export type DnsLookup = (
  hostname: string,
  options: LookupAllOptions,
) => Promise<LookupAddress[]>;

export class ProxyError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const DEFAULT_ALLOWED_HOSTS = [
  "e5vosdo.hu",
  "info.e5vosdo.hu",
  "drive.google.com",
  "lh3.googleusercontent.com",
  "picsum.photos",
];

const DEFAULT_ALLOWED_ORIGINS = "https://e5vosdo.hu,https://info.e5vosdo.hu";
const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const DEFAULT_MAX_REDIRECTS = 3;

export function buildImageProxyConfig(): ImageProxyConfig {
  return {
    allowedHosts: DEFAULT_ALLOWED_HOSTS.map((host) => host.toLowerCase()),
    allowedOrigins: DEFAULT_ALLOWED_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    timeoutMs: DEFAULT_TIMEOUT_MS,
    maxImageBytes: DEFAULT_MAX_IMAGE_BYTES,
    maxRedirects: DEFAULT_MAX_REDIRECTS,
  };
}

export function isHostAllowed(hostname: string, allowedHosts: string[]) {
  const normalized = hostname.toLowerCase();
  return allowedHosts.some((entry) => {
    if (entry.startsWith("*.")) {
      const suffix = entry.slice(1);
      return normalized === suffix.slice(1) || normalized.endsWith(suffix);
    }
    if (entry.startsWith(".")) {
      return normalized === entry.slice(1) || normalized.endsWith(entry);
    }
    return normalized === entry;
  });
}

function isPrivateIpv4(address: string) {
  const parts = address.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return false;
  }

  const [first, second] = parts;
  if (first === 10) return true;
  if (first === 127) return true;
  if (first === 169 && second === 254) return true;
  if (first === 172 && second >= 16 && second <= 31) return true;
  if (first === 192 && second === 168) return true;
  return false;
}

function isPrivateIpv6(address: string) {
  const normalized = address.toLowerCase();
  if (normalized === "::1" || normalized === "0:0:0:0:0:0:0:1") {
    return true;
  }
  if (normalized.startsWith("fe80:")) return true; // link-local
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true; // ULA

  const ipv4Suffix = normalized.split(":").pop();
  if (ipv4Suffix && net.isIP(ipv4Suffix) === 4) {
    return isPrivateIpv4(ipv4Suffix);
  }

  return false;
}

export function isPrivateAddress(address: string) {
  const ipVersion = net.isIP(address);
  if (ipVersion === 4) return isPrivateIpv4(address);
  if (ipVersion === 6) return isPrivateIpv6(address);
  return false;
}

const defaultLookup: DnsLookup = (hostname, options) =>
  dns.lookup(hostname, options);

export async function assertPublicHost(
  hostname: string,
  lookup: DnsLookup = defaultLookup,
) {
  const ipVersion = net.isIP(hostname);
  if (ipVersion) {
    if (isPrivateAddress(hostname)) {
      throw new ProxyError("Blocked private address", 403);
    }
    return;
  }

  const records = await lookup(hostname, { all: true, verbatim: true });
  if (!records.length) {
    throw new ProxyError("Host has no resolved addresses", 400);
  }

  if (records.some((record) => isPrivateAddress(record.address))) {
    throw new ProxyError("Blocked private address", 403);
  }
}

export async function validateUrl(
  url: URL,
  config: Pick<ImageProxyConfig, "allowedHosts">,
  lookup?: DnsLookup,
) {
  if (!url.protocol || !["http:", "https:"].includes(url.protocol)) {
    throw new ProxyError("Invalid URL scheme", 400);
  }
  if (url.username || url.password) {
    throw new ProxyError("Credentials are not allowed in URL", 400);
  }

  const hostname = url.hostname.toLowerCase();
  if (!isHostAllowed(hostname, config.allowedHosts)) {
    throw new ProxyError("Host is not allowed", 403);
  }

  await assertPublicHost(hostname, lookup);
}
