import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const COOKIE_PREFIX = IS_PRODUCTION ? "__Secure-" : "";
const SESSION_MAX_AGE = (60 * 60 * 24 * 365) / 2;
const COOKIE_DOMAIN =
  process.env.AUTH_COOKIE_DOMAIN ?? (IS_PRODUCTION ? ".e5vosdo.hu" : undefined);
const ALLOWED_ORIGINS = (
  process.env.AUTH_ALLOWED_ORIGINS ??
  "https://e5vosdo.hu,https://info.e5vosdo.hu"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: {
    maxAge: SESSION_MAX_AGE,
    updateAge: 60 * 60 * 24,
  },
  cookies: {
    sessionToken: {
      name: `${COOKIE_PREFIX}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: IS_PRODUCTION,
        maxAge: SESSION_MAX_AGE,
        domain: COOKIE_DOMAIN,
      },
    },
    callbackUrl: {
      name: `${COOKIE_PREFIX}next-auth.callback-url`,
      options: {
        sameSite: "lax" as const,
        path: "/",
        secure: IS_PRODUCTION,
        domain: COOKIE_DOMAIN,
      },
    },
    csrfToken: {
      name: `${COOKIE_PREFIX}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: IS_PRODUCTION,
        domain: COOKIE_DOMAIN,
      },
    },
    pkceCodeVerifier: {
      name: `${COOKIE_PREFIX}next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: IS_PRODUCTION,
        maxAge: 60 * 15,
        domain: COOKIE_DOMAIN,
      },
    },
  },
  callbacks: {
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      const allowedOrigins = new Set(ALLOWED_ORIGINS);
      allowedOrigins.add(new URL(baseUrl).origin);

      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      try {
        const urlObj = new URL(url);
        if (allowedOrigins.has(urlObj.origin)) {
          return url;
        }
      } catch {
        return baseUrl;
      }

      return baseUrl;
    },
  },
  trustHost: true,
  basePath: "/api/auth",
};

function getAuth() {
  if (process.env.FAKE_AUTH == "true") {
    return () => {
      return {
        user: {
          name: process.env.FAKE_NAME,
          email: process.env.FAKE_EMAIL,
          image: process.env.FAKE_IMAGE,
        },
      };
    };
  } else {
    const { auth } = NextAuth(nextAuthConfig);
    return auth;
  }
}

const auth = getAuth();
const {
  handlers: { GET, POST },
  signIn,
  signOut,
} = NextAuth(nextAuthConfig);

export { GET, POST, auth, signIn, signOut };
