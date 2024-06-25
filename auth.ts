import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

let auth: any;

if (process.env.FAKE_AUTH == "true") {
  auth = () => {
    return {
      user: {
        name: process.env.FAKE_NAME,
        email: process.env.FAKE_EMAIL,
        image: process.env.FAKE_IMAGE,
      },
    };
  };
} else {
  auth = NextAuth({
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
}

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
