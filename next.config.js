/** @type {import('next').NextConfig} */


const { execSync } = require("child_process");
const command1 = "pip3.11 install bs4";
const output1 = execSync(command1, { encoding: "utf-8" }); // Capture output
console.log(output1); // Print the output of the command

const command2 = "pip3.11 install requests";
const output2 = execSync(command2, { encoding: "utf-8" }); // Capture output

console.log(output2); // Print the output of the command

const withPWAInit = require("next-pwa");

const isDev = process.env.NODE_ENV !== "production";

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
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true
    }
  }
}

module.exports = withPWA(nextConfig);
