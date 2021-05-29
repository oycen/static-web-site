const express = require("express");
const basicAuth = require("express-basic-auth");
const path = require("path");
const os = require("os");
const ip = require("ip");
const open = require("open");
const serveIndex = require("./serve-index");
const config = require(path.join(os.homedir(), "./.swsrc.json"));

const app = express();
const address = ip.address();
const port = config.port;
const public = path.join(os.homedir(), config.public);

app.use(
  basicAuth({
    users: config.users,
    challenge: true,
  })
);

app.use("/", (req, res, next) => {
  if (req.auth.user === "admin") {
    next();
    return;
  }

  const permissionDir = req.path.substring(1, req.path.indexOf("/", 1));

  if (permissionDir !== "/" && permissionDir !== req.auth.user) {
    res.sendStatus(403);
  } else {
    next();
  }
});

app.use(
  "/",
  express.static(public),
  serveIndex(public, {
    icons: true,
    hidden: false,
    view: "details",
    filter(filename, index, files, dir, req) {
      if (req.auth.user === "admin") return true;

      const permissionDir = req.path.substring(1, req.path.indexOf("/", 1));
      if (permissionDir === "/" && filename === req.auth.user) return true;
      if (permissionDir === req.auth.user) return true;
      return false;
    },
  })
);

app.listen(port, () => {
  console.log(`app listening at http://${address}`);
  open(`http://${address}`);
});
