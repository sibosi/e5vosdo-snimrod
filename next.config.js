/** @type {import('next').NextConfig} */
const cron = require('node-cron');
const { spawn } = require('child_process');

cron.schedule('* * * * *', function () {
  console.log('Say scheduled hello')

  // Python szkript futtatása
  const pythonProcess = spawn('python', ['components\\helyettesites\\getTable.py']);

  // A folyamat kimenetének kezelése
  pythonProcess.stdout.on('data', (data) => {
    console.log(`Output from Python script: ${data}`);
  });

  // Hiba kezelése
  pythonProcess.stderr.on('data', (data) => {
    console.error(`Error from Python script: ${data}`);
  });

  // Folyamat befejezésének kezelése
  pythonProcess.on('close', (code) => {
    //console.log(`Python script exited with code ${code}`);
    console.log('Python script is finished.')
  });
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
  plugins: [
    require('daisyui'),
  ],
  logging: {
    fetches: {
      fullUrl: true
    }
  }
}

module.exports = withPWA(nextConfig);
