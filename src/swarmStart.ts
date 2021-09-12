import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { customGun } from "tool-db";
import dotenv from "dotenv";
import swarm from "discovery-swarm";

import { PORT } from "./constants";
import Gun from "gun";

dotenv.config();
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(Gun.serve);

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

let peers: Record<string, number> = {};

export default async function swarmStart() {
  var sw = swarm();

  sw.listen(4000);
  sw.join("mtgatool-db-swarm"); // can be any id/name/hash

  sw.on("connection", function (connection: any) {
    peers[connection.remoteAddress] = new Date().getTime();
    console.log("found + connected to peer", connection.remoteAddress);
  });

  sw.on("peer", function (data: any) {
    peers[data.host] = new Date().getTime();
    console.log("found peer", data.host);
  });

  // Setup Express
  app.get("/", (_req: any, res: any) => {
    res.json({ ok: true, msg: "You found the root!" });
  });

  app.get("/peers", (_req: any, res: any) => {
    res.json({ peers });
  });

  const server = app.listen(PORT, () => {
    console.log("Relay peer started on port " + PORT + "/gun");
  });

  customGun(Gun);
  Gun({ web: server, file: "data" });
}
