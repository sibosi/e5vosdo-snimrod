import PleaseLogin from "@/app/(e5vosdo)/me/redirectToLogin";
import MainLayout from "@/app/mainLayoutWithLogLoginProp";
import { addLog, getAuth } from "@/db/dbreq";
import { headers } from "next/headers";

async function logLogin(email: string | undefined | null) {
  if (email) addLog("login", email);
  else
    addLog(
      "login",
      (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? // proxy mögül
        (await headers()).get("x-real-ip") ??
        "unknown ip",
    );
}

export default async function MerchPage() {
  const selfUser = await getAuth();

  if (!selfUser)
    return (
      <MainLayout logLogin={logLogin}>
        <PleaseLogin />
      </MainLayout>
    );

  const email = selfUser.email;
  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? // proxy mögül
    (await headers()).get("x-real-ip") ??
    "unknown ip";

  void addLog("merch_form_opened", `email: ${email}, ip: ${ip}`);

  return (
    <html
      lang="hu"
      suppressHydrationWarning
      className="m-0 h-full overflow-hidden"
    >
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        />
        <title>Merch Szavazás</title>
        <script async src="https://tally.so/widgets/embed.js" />
      </head>
      <body
        style={{
          width: "100%",
          height: "100%",
          margin: 0,
          overflow: "hidden",
        }}
      >
        <iframe
          data-tally-src={"https://tally.so/r/8Naq2P?transparentBackground=1&userId=" +
            encodeURIComponent(email) + "&userIp=" + encodeURIComponent(ip)
          }
          width="100%"
          height="100%"
          className="fixed inset-0 block h-dvh w-screen border-0"
          title="Merch Szavazás"
          style={{
            position: "fixed",
            inset: 0,
            display: "block",
            width: "100vw",
            height: "100dvh",
            border: 0,
          }}
        ></iframe>
      </body>
    </html>
  );
}
