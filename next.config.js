/** @type {import('next').NextConfig} */
const { execSync } = require("child_process");
const cron = require('node-cron');

const command1 = "pip3 install -r requirements.txt";
const output1 = execSync(command1, { encoding: "utf-8" });
console.log(output1);

cron.schedule('0 * * * *', function () {
  console.log('Say scheduled hello')
  const pythonProcess = spawn('python3', ['components/helyettesites/getTable.py']);

  pythonProcess.stdout.on('data', (data) => {
    console.log(`Output from Python script: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Error from Python script: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log('Python script is finished.')
  });
});

cron.schedule('* * * * *', function () {
  console.log('Say scheduled hello - updater')
  const command = "python3 updater.py";
  const output = execSync(command, { encoding: "utf-8" }); // Capture output
  console.log(output); // Print the output of the command
});

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
