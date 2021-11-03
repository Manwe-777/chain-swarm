import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { getIpFromUrl, ToolDb } from "tool-db";
import dotenv from "dotenv";
import publicIp from "public-ip";

import { PORT } from "./constants";

const DC = require("discovery-channel");

dotenv.config();
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3006",
  "http://mtgatool.com/",
];

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
  publicIp.v4().then((currentIp) => {
    console.log("Server peer IP: ", currentIp);

    const toolDb = new ToolDb({
      server: true,
      port: PORT,
      debug: true,
    });

    var channel = DC();
    channel.join("mtgatool-db-swarm-v2", PORT);

    channel.on("peer", (_id: any, peer: any) => {
      if (currentIp !== peer.host) {
        if (!toolDb.websockets.allPeers.includes(peer.host)) {
          console.log(`Joining federated server at ${peer.host}:${peer.port}`);
          toolDb.websockets.open(`http://${peer.host}:${peer.port}`);
        }
      }
    });

    // Setup Express
    app.get("/", (_req: any, res: any) => {
      res.json({ ok: true, msg: "You found the root!" });
    });

    app.get("/peers", (_req: any, res: any) => {
      res.json({ peers: toolDb.websockets.activePeers });
    });

    const server = app.listen(80, () => {
      console.log("Relay peer started on port " + 80);
    });
  });
}
