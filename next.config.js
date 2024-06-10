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

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const withPWA = withPWAInit({
  dest: 'public',
  disable: isDev,


  exclude: [
    // add buildExcludes here
    ({ asset, compilation }) => {
      if (
        asset.name.startsWith("server/") ||
        asset.name.match(/^((app-|^)build-manifest\.json|react-loadable-manifest\.json)$/)
      ) {
        return true;
      }
      if (isDev && !asset.name.startsWith("static/runtime/")) {
        return true;
      }
      return false;
    }
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
}

module.exports = withBundleAnalyzer(withPWA(nextConfig))
