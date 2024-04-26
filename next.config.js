/** @type {import('next').NextConfig} */
const nextConfig = {};

//module.exports = nextConfig;

const withPWA = require("next-pwa")({
  dest: "public",
});

module.exports = withPWA({});
