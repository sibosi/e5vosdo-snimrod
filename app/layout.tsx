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
import OGURL from "./ogurl";
import LoadCacheMethod from "./loadCacheMethod";
import OnCSSBug from "@/components/home/oncssbug";
import Alerts from "@/components/home/alerts";
const PushManager = dynamic(() => import("../components/PWA/push"), {
  ssr: false,
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  authors: [{ name: "S-", url: "https://google.com" }],
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  try {
    if (session?.user) await updateUser(session?.user as User);
  } catch (e) {
    console.log(e);
  }
  const selfUser = await getAuth(session?.user?.email ?? undefined);

  const pageSettings = await getPageSettings();
  if (session?.user?.email) console.log("New user: " + session.user.email);

  return (
    <html lang="hu" suppressHydrationWarning className="bg-selfprimary-bg">
      <head>
        <link rel="canonical" href={siteConfig.links.home} />
        <link rel="alternative" href={siteConfig.links.alternative} />
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
          href="windows11/SmallTile.scale-00.png"
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
        <meta name="darkreader-lock" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Manrope:wght@200..800&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Outfit:wght@100..900&family=Pacifico&family=Playwrite+DE+Grund:wght@100..400&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Raleway:ital,wght@0,100..900;1,100..900&family=Spicy+Rice&family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
      </head>

      <body
        className={clsx(
          "min-h-screen bg-background bg-selfprimary-bg font-sans antialiased",
          fontSans.variable,
          "light:bg-white",
        )}
        style={{
          fontFamily: "Outfit, sans-serif",
        }}
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
        <LoadCacheMethod />
        <OGURL isFakeAuth={process.env.FAKE_AUTH === "true"} />
        <ServiceWorker />
        <PushManager />
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          <div className="relative flex h-screen flex-col bg-selfprimary-bg">
            <Navbar
              selfUser={selfUser}
              isActiveHeadSpace={pageSettings.headspace === 1}
              className="bg-selfprimary-bg"
            />

            <Cookie />
            <Alerts />
            <main className="container mx-auto max-w-7xl flex-grow bg-selfprimary-bg pl-3 pr-3 pt-4">
              <OnCSSBug />
              {children}
            </main>
            <footer className="flex w-full items-center justify-center bg-selfprimary-bg py-3">
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
          </div>
        </Providers>
        <GoogleAnalytics measurementId="G-P74RJ9THHS" />
      </body>
    </html>
  );
}
