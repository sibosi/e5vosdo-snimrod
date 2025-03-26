import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Single shared configuration for NextAuth
const nextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      }})
  ],
  callbacks: {
    async redirect({ url, baseUrl }: any) {
      const allowedRedirectUrls = process.env.NEXTAUTH_ALLOWED_URLS?.split(",") || [];
      
      if (allowedRedirectUrls.some((allowedUrl) => url.startsWith(allowedUrl))) {
        return url;
      }
      
      return baseUrl;
    },
  },
  secret: process.env.AUTH_SECRET,
  basePath: "/api/auth",
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};

function getAuth() {
  if (process.env.FAKE_AUTH === "true") {
    return () => ({
      user: {
        name: process.env.FAKE_NAME,
        email: process.env.FAKE_EMAIL,
        image: process.env.FAKE_IMAGE,
      },
    });
  } else {
    const { auth } = NextAuth(nextAuthConfig);
    return auth;
  }
}

const auth = getAuth();

const { handlers, signIn, signOut } = NextAuth(nextAuthConfig);
const { GET, POST } = handlers;

export { GET, POST, auth, signIn, signOut };
