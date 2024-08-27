import "@/styles/globals.css";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Providers } from "./providers";
import { Navbar } from "@/components/navbar/navbar";
import { Link } from "@nextui-org/link";
import clsx from "clsx";
import { PageNav } from "@/components/pagenav";
import { auth } from "@/auth";
import Access from "@/components/account/access";
import Script from "next/script";
import GoogleAnalytics from "@bradgarropy/next-google-analytics";
import ServiceWorker from "@/components/PWA/serviceWorker";
import {
  getAuth,
  getPageSettings,
  getStudentUsersEmail,
  updateUser,
  User,
} from "@/db/dbreq";
import dynamic from "next/dynamic";
import Cookie from "@/components/cookie";
import SkipMessenger from "./skipMessenger";
import OGURL from "./ogurl";
const PushManager = dynamic(() => import("../components/PWA/push"), {
  ssr: false,
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  authors: [{ name: "Simon Nimród Zalán", url: "https://github.com/sibosi" }],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/ios/1024.png",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  session?.user ? await updateUser(session?.user as User) : null;
  const users = await getStudentUsersEmail();
  const selfUser = await getAuth(session?.user?.email ?? undefined);

  const pageSettings = await getPageSettings();

  return (
    <html lang="hu" suppressHydrationWarning className="bg-background">
      <head>
        <link rel="apple-touch-icon" href="ios/1024.png" sizes="1024x1024" />
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="icon"
          href="windows11/SmallTile.scale-100.png"
          sizes="71x71"
        />
        <link
          rel="icon"
          href="windows11/SmallTile.scale-125.png"
          sizes="89x89"
        />
        <link
          rel="icon"
          href="windows11/SmallTile.scale-150.png"
          sizes="107x107"
        />
        <link
          rel="icon"
          href="windows11/SmallTile.scale-200.png"
          sizes="142x142"
        />
        <link
          rel="icon"
          href="windows11/SmallTile.scale-400.png"
          sizes="284x284"
        />
        <link
          rel="icon"
          href="android/android-launchericon-512-512.png"
          sizes="512x512"
        />
        <link
          rel="icon"
          href="android/android-launchericon-192-192.png"
          sizes="192x192"
        />
      </head>

      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          "light:bg-white",
        )}
      >
        <Script
          async
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-P74RJ9THHS"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-P74RJ9THHS');
          `}
        </Script>
        <OGURL />
        <ServiceWorker />
        <PushManager />
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          <div className="bg-selfprimary-20 relative flex h-screen flex-col">
            <Navbar
              selfUser={selfUser}
              isActiveHeadSpace={pageSettings.headspace}
              className="bg-selfprimary-20"
            />

            <Cookie />
            <SkipMessenger />

            {session &&
            session.user &&
            session.user.email &&
            (users as string[]).includes(session.user.email) ? (
              <>
                {console.log("New login from " + session.user.email)}
                <main className="bg-selfprimary-20 container mx-auto max-w-7xl flex-grow pl-3 pr-3 pt-4">
                  {children}
                </main>
                <footer className="bg-selfprimary-20 flex w-full items-center justify-center py-3">
                  <Link
                    isExternal
                    className="flex items-center gap-1 pb-14 text-current"
                    href={siteConfig.links.mypage}
                    title="Nimród oldala"
                  >
                    <span className="text-default-600">Fejlesztette</span>
                    <p className="text-selfprimary">Simon Nimród</p>
                    <span className="text-default-600">10.C</span>
                  </Link>
                  <br />
                  <PageNav />
                </footer>
              </>
            ) : (
              <>
                <Access
                  name={
                    session && session.user && session.user.name
                      ? session.user.name
                      : undefined
                  }
                />
              </>
            )}
          </div>
        </Providers>
        <GoogleAnalytics measurementId="G-P74RJ9THHS" />
      </body>
    </html>
  );
}
