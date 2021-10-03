import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { customGun, ToolDbClient } from "tool-db";
import dotenv from "dotenv";

import { PORT } from "./constants";
import Gun from "gun";

const DC = require("discovery-channel");

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
  var channel = DC();
  channel.join("mtgatool-db-swarm", 4000, console.log);

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

  const toolDb = new ToolDbClient();
  toolDb.debug = true;
  customGun(Gun);
  Gun({ web: server, file: "data" });
}
