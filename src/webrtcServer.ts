import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { ToolDb } from "mtgatool-db";
import wrtc from "wrtc";
import dotenv from "dotenv";
import publicIp from "public-ip";
import fs from "fs";
import http from "http";
import https from "https";

dotenv.config();

import { USE_HTTP, PORT, SWARM_KEY } from "./constants";
import expressSetup from "./expressSetup";

dotenv.config();
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var allowedOrigins = ["http://localhost:3000", "http://localhost:3006"];

app.use(
  cors({
    origin: function (
      origin: string | undefined,
      callback: (e: any, b: boolean) => void
    ) {
      // allow requests with no origin
      // (like mobile apps or curl requests)npm i
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

export default async function webrtcServer() {
  console.log("USE_HTTP ", USE_HTTP);
  console.log("PORT ", PORT);
  publicIp.v4().then((currentIp) => {
    console.log(new Date().toUTCString());
    console.log("Server IP: ", currentIp);

    var httpServer;
    var httpsServer;

    if (USE_HTTP) {
      httpServer = http.createServer(app);
      httpServer.listen(80);
    }

    if (PORT === 443) {
      var privateKey = fs.readFileSync("ssl/server.key", "utf8");
      var certificate = fs.readFileSync("ssl/server.crt", "utf8");
      var credentials = { key: privateKey, cert: certificate };
      httpsServer = https.createServer(credentials, app);
      httpsServer.listen(443);
    }

    const toolDb = new ToolDb({
      peers: [],
      server: true,
      useWebrtc: true,
      serveSocket: true,
      debug: true,
      topic: SWARM_KEY,
      port: PORT,
      wrtc: wrtc,
    } as any);

    // You should be able to provide your own server user or keys!
    toolDb.anonSignIn();
    expressSetup(app, toolDb);
  });
}
