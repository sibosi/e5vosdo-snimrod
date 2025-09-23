import "@/styles/globals.css";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Providers } from "@/app/providers";
import { Navbar } from "@/components/navbar/navbar";
import { Link } from "@heroui/react";
import clsx from "clsx";
import { PageNav } from "@/components/pagenav";
import { auth } from "@/auth";
import GoogleAnalytics from "@bradgarropy/next-google-analytics";
import ServiceWorker from "@/components/PWA/serviceWorker";
import { getAuth, updateUser, User } from "@/db/dbreq";
import Cookie from "@/components/cookie";
import OnCSSBug from "@/components/home/oncssbug";
import Alerts from "@/components/home/alerts";
import MaintenanceGate from "@/components/home/maintenanceGate";
import RunClientSideWrapper from "@/app/runClientSideWrapper";
import DesktopMenu from "@/components/home/desktopMenu";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  authors: [{ name: "Simon Nimród", url: siteConfig.links.mypage }],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/icon/512.png",
    apple: "/icon/1024.png",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default async function MainLayout({
  children,
  logLogin,
}: Readonly<{
  children: React.ReactNode;
  logLogin: (email: string | undefined | null) => void;
}>) {
  const session = await auth();
  if (session?.user)
    updateUser(session?.user as User, true).catch((e) => console.log(e));

  const selfUser = await getAuth(session?.user?.email ?? undefined);

  logLogin(session?.user?.email);

  return (
    <html lang="hu" suppressHydrationWarning className="bg-selfprimary-bg">
      <head>
        <link rel="canonical" href={siteConfig.links.home} />
        <link rel="alternative" href={siteConfig.links.alternative} />
        <link rel="apple-touch-icon" href="icon/1024.png" sizes="1024x1024" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="icon/1024.png" sizes="1024x1024" />
        <link rel="icon" href="icon/512.png" sizes="512x512" />
        <link rel="icon" href="icon/192.png" sizes="192x192" />
        <meta name="darkreader-lock" />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content="#ffffff"
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="#0b1220"
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
        <RunClientSideWrapper />
        <ServiceWorker />
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          <div className="relative flex h-screen flex-col bg-selfprimary-bg">
            <Navbar selfUser={selfUser} className="bg-selfprimary-bg" />

            <Cookie />
            <Alerts />
            <main className="container mx-auto max-w-full flex-grow bg-selfprimary-bg px-3 pt-4">
              <OnCSSBug />
              <MaintenanceGate selfUser={selfUser} isActive={false}>
                <div className="flex justify-start gap-3">
                  <DesktopMenu />
                  <div className="w-full max-w-7xl md:mx-auto">{children}</div>
                </div>
              </MaintenanceGate>
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
