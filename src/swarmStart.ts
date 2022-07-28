import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { ToolDb, ToolDbNetwork } from "mtgatool-db";
import dotenv from "dotenv";
import publicIp from "public-ip";
import fs from "fs";
import http from "http";
import https from "https";

dotenv.config();

// This is a bad solution but will help connecting to basically any peer
(process as any).env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

import { USE_DHT, USE_HTTP, PORT, SWARM_KEY } from "./constants";
import expressSetup from "./expressSetup";

const DC = require("discovery-channel");

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
      // (like mobile apps or curl requests)
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

export default async function swarmStart() {
  console.log("USE_DHT ", USE_DHT);
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

    const toolDb = new ToolDb(
      httpsServer
        ? {
            httpServer: httpsServer,
            useWebrtc: false,
            serveSocket: true,
            server: true,
            debug: true,
            topic: SWARM_KEY,
            host: currentIp,
            port: undefined,
          }
        : {
            httpServer: httpsServer,
            useWebrtc: false,
            serveSocket: true,
            server: true,
            debug: true,
            topic: SWARM_KEY,
            host: currentIp,
            port: PORT,
          }
    );

    // You should be able to provide your own server user or keys!
    toolDb.anonSignIn();

    // Setup Express
    expressSetup(app, toolDb);

    var channel = DC();
    if (USE_DHT) {
      console.log("Joining swarm " + SWARM_KEY);
      channel.join(SWARM_KEY, PORT);
    } else {
      channel.join(SWARM_KEY);
    }

    const checkedPeers: string[] = [];

    channel.on("peer", (_id: any, peer: any) => {
      if (!checkedPeers.includes(peer.host + ":" + peer.port)) {
        console.log("DHT Peer ", peer.host, peer.port);
        if (currentIp !== peer.host) {
          // If this peer is not on our connected list yet
          if (
            Object.values(toolDb.peers).filter((p) => p.host === peer.host)
              .length === 0
          ) {
            (toolDb.network as ToolDbNetwork).connectTo(peer.host, peer.port);
          }
        }
        checkedPeers.push(peer.host + ":" + peer.port);
      }
    });
  });
}
