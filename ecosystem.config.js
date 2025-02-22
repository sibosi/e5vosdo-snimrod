module.exports = {
  apps: [
    {
      name: "e5vosdo-snimrod",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: "max",
      exec_mode: "cluster",
      cwd: "/app",
    },
  ],
};
