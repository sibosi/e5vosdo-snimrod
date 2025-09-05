import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const COOKIE_DOMAIN =
  process.env.NODE_ENV === "production" ? ".e5vosdo.hu" : undefined;

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
  cookies: {
    sessionToken: {
      name: "__Secure-next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: COOKIE_DOMAIN,
      },
    },
    callbackUrl: {
      name: "__Secure-next-auth.callback-url",
      options: {
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: COOKIE_DOMAIN,
      },
    },
    csrfToken: {
      name: "__Secure-next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: COOKIE_DOMAIN,
      },
    },
    pkceCodeVerifier: {
      name: "__Secure-next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 15,
        domain: COOKIE_DOMAIN,
      },
    },
  },
  callbacks: {
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      const allowedOrigins = ["https://e5vosdo.hu", "https://info.e5vosdo.hu"];

      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      try {
        const urlObj = new URL(url);
        if (allowedOrigins.includes(urlObj.origin)) {
          return url;
        }
      } catch (error) {
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
