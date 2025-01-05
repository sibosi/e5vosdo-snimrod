import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

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
    const { auth } = NextAuth({
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
      callbacks: {
        async redirect({ url, baseUrl }) {
          return url.startsWith(baseUrl) ? url : baseUrl;
        },
      },
      secret: process.env.AUTH_SECRET,
      basePath: "/api/auth",
    });

    return auth;
  }
}

const auth = getAuth();

const {
  handlers: { GET, POST },
  signIn,
  signOut,
} = NextAuth({
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
  basePath: "/api/auth",
});

export { GET, POST, auth, signIn, signOut };
