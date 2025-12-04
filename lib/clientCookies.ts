export type CookieSameSite = "Lax" | "Strict" | "None";

export interface CookieOptions {
  maxAge?: number;
  path?: string;
  sameSite?: CookieSameSite;
  secure?: boolean;
}

const isClient = () => typeof document !== "undefined";

export const getCookie = (name: string): string | undefined => {
  if (!isClient()) return undefined;

  const encodedName = encodeURIComponent(name);
  const cookies = document.cookie ? document.cookie.split(";") : [];

  for (const cookie of cookies) {
    const [rawName, ...rest] = cookie.split("=");
    if (rawName.trim() === encodedName) {
      const rawValue = rest.join("=");
      return decodeURIComponent(rawValue.trim());
    }
  }

  return undefined;
};

export const setCookie = (
  name: string,
  value: string,
  options: CookieOptions = {},
) => {
  if (!isClient()) return;

  const directives = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    `path=${options.path ?? "/"}`,
  ];

  const maxAge = options.maxAge ?? 60 * 60 * 24 * 365 * 5; // default to 5 years
  if (Number.isFinite(maxAge)) {
    directives.push(`max-age=${Math.floor(maxAge)}`);
  }

  const sameSite = options.sameSite ?? "Lax";
  directives.push(`SameSite=${sameSite}`);

  if (options.secure) {
    directives.push("Secure");
  }

  document.cookie = directives.join("; ");
};
