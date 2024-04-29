import "@/styles/globals.css";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Providers } from "./providers";
import { Navbar } from "@/components/navbar";
import { Link } from "@nextui-org/link";
import clsx from "clsx";
import { link as linkStyles } from "@nextui-org/theme";
import { color } from "framer-motion";
import { PageNav } from "@/components/pagenav";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/ios/1024.png",
  },

  //name:"apple-mobile-web-app-capable",
  //content:"yes"
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          "light:bg-white"
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          <div className={clsx("relative flex flex-col h-screen")}>
            <Navbar />
            <main className="container mx-auto max-w-7xl pt-16 pl-3 pr-5 flex-grow">
              {children}
            </main>
            <footer className="w-full flex items-center justify-center py-3">
              <br />
              <br />
              <br />

              <Link
                isExternal
                className="flex items-center gap-1 text-current"
                href="https://github.com/Sibosi"
                title="Sibosi's homepage"
              >
                <span className="text-default-600">Developed by</span>
                <p className="text-primary">Sibosi</p>
              </Link>
              <PageNav />
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
