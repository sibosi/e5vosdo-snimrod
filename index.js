const cluster = require("cluster");
const os = require("os");
const next = require("next");
const express = require("express");

let numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Fő process indul, ${numCPUs} CPU mag indítása...`);
  // Indítsuk el a worker process-eket a rendelkezésre álló CPU magok számával
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker process ${worker.process.pid} leállt.`);
    // Opció: Újraindíthatjuk az elhalt worker-t, ha szükséges:
    // cluster.fork();
  });
} else {
  const app = next({ dev: false });
  const handle = app.getRequestHandler();

  app.prepare().then(() => {
    const server = express();

    server.all("*", (req, res) => {
      return handle(req, res);
    });

    server.listen(3000, (err) => {
      if (err) throw err;
      console.log(`Worker process ${process.pid} fut a 3000-as porton.`);
    });
  });
}
