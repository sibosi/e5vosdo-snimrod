/** @type {import('next').NextConfig} */
const { execSync } = require("child_process");

/*
if (true) {
  const pyOutput = execSync("pip3 install -r requirements.txt", { encoding: "utf-8" });
  console.log(pyOutput);
}
*/

const withPWAInit = require("next-pwa");
const isDev = process.env.NODE_ENV !== "production";

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const withPWA = withPWAInit({
  dest: "public",
  disable: isDev,
  register: false,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ],
  },
  typescript: {
    ignoreBuildErrors: process.env.IGNORE_BUILD_ERRORS === "true",
  },
};

module.exports = withBundleAnalyzer(withPWA(nextConfig));
