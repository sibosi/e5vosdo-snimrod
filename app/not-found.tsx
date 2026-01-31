import Link from "next/link";
import { siteConfig } from "@/config/site";
import "@/styles/globals.css";
import { fontSans } from "@/config/fonts";
import { Providers } from "@/app/providers";
import clsx from "clsx";
import GoogleAnalytics from "@bradgarropy/next-google-analytics";

export default async function NotFoundPage() {
  return (
    <html lang="hu" suppressHydrationWarning className="bg-selfprimary-bg">
      <head>
        <link rel="canonical" href={siteConfig.links.home} />
        <link rel="alternative" href={siteConfig.links.alternative} />
        <link rel="apple-touch-icon" href="icons/1024.png" sizes="1024x1024" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="icons/1024.png" sizes="1024x1024" />
        <link rel="icon" href="icons/512.png" sizes="512x512" />
        <link rel="icon" href="icons/192.png" sizes="192x192" />
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
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          <div className="flex items-center justify-center text-center text-selfprimary">
            <div className="inline-block pr-6 align-top text-3xl font-medium">
              <h1 className="pt-1">404</h1>
            </div>
            <div className="inline-block pl-6">
              <p className="text-md m-0 font-normal">Elvesztünk?</p>
              <Link
                className="flex items-center gap-1 text-current transition-colors hover:opacity-80"
                href="/"
              >
                <span className="text-default-600">Vissza </span>
                <p className="text-selfprimary">haza!</p>
              </Link>
              <br />

              <Link
                className="flex items-center gap-1 text-current transition-colors hover:opacity-80"
                href={siteConfig.links.feedback}
              >
                <p className="font-medium text-red-700">Hibát</p>
                <span className="text-default-600">találtál?</span>
              </Link>
            </div>
          </div>
        </Providers>
        <GoogleAnalytics measurementId="G-P74RJ9THHS" />
      </body>
    </html>
  );
}
