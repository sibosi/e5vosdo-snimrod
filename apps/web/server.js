// server.js
const { readFileSync } = require("fs");
const { createServer } = require("https");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: readFileSync("./local.e5vos.hu+2-key.pem"),
  cert: readFileSync("./local.e5vos.hu+2.pem"),
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    handle(req, res);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log("> HTTPS dev server ready: https://local.e5vos.hu:3000");
  });
});
