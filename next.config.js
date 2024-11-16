/** @type {import('next').NextConfig} */

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

/** @type {import('next').NextConfig} */
const nextConfig = {
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
    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
