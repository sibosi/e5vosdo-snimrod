import type { NextConfig } from "next";

/*
const { execSync } = require("child_process");
if (true) {
  const pyOutput = execSync("pip3 install -r requirements.txt", { encoding: "utf-8" });
  console.log(pyOutput);
}
*/

const fs = require("fs");
const path = require("path");

const isDev = process.env.NODE_ENV !== "production";

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactProductionProfiling: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "www.ejg.hu",
        port: "",
        pathname: "/wp-content/uploads/**",
      },
      {
        hostname: "encrypted-tbn0.gstatic.com",
        protocol: "https",
      },
      {
        hostname:
          process.env.NEXT_PUBLIC_SUPABASE_URL?.replace("https://", "") ??
          "localhost",
        protocol: "https",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: process.env.IGNORE_BUILD_ERRORS === "true",
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      const podcastsDir = path.join(__dirname, "podcasts");

      // Check if the 'podcasts' directory exists, if not, create it
      if (!fs.existsSync(podcastsDir)) {
        fs.mkdirSync(podcastsDir, { recursive: true });
        console.log("Podcasts directory created.");
      }
    }
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  serverExternalPackages: ["pdfkit"],
  experimental: {
    serverActions: {
      allowedOrigins: [process.env.NEXTAUTH_URL + "/api/upload"],
      bodySizeLimit: 1024 * 1024 * 10, // 10MB
    },
  },
  allowedDevOrigins: ["http://localhost:3000", "http://127.0.0.1:3000"],
};

module.exports = withBundleAnalyzer(nextConfig);
