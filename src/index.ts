import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { customGun, sha256 } from "tool-db";
import dotenv from "dotenv";
import dht from "@hyperswarm/dht";

import { PORT, BASE_URI } from "./constants";
import api from "./endpoints/api";
import Gun from "gun";

dotenv.config();
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(Gun.serve);

var allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3006",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3006",
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

export default async function init() {
  // Announce this server
  const node = dht({
    ephemeral: true,
  });
  const keyHash = sha256(process.env.SWARM_KEY || "");
  const topicKey = Buffer.from(keyHash, "hex");
  node.announce(topicKey, { port: 4000 }, function (err: any) {
    if (err) throw err;
    console.log("Announced this server at " + keyHash);
  });

  // Setup Express
  app.get(BASE_URI, (_req: any, res: any) => {
    res.json({ ok: true, msg: "You found the root!" });
  });

  console.log("Creating endpoints:");
  api.setup(app);

  const server = app.listen(PORT, () => {
    console.log("Relay peer started on port " + PORT + "/gun");
  });

  customGun(Gun);
  var gun = Gun({ web: server, file: "data" });
}

init();
