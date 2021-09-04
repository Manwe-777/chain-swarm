import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { sha256, ToolDbService, verifyMessage } from "tool-db";
import dotenv from "dotenv";
import dht from "@hyperswarm/dht";
import hyperswarm from "hyperswarm";
import ndjson from "ndjson";
import parse from "fast-json-parse";
import level from "level";

import { PORT, BASE_URI } from "./constants";
import api from "./endpoints/api";
import { PipeHandshake, PipeMessage, PipePut } from "./types";

dotenv.config();
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

const idToSockets: Record<
  string,
  {
    in: ReturnType<typeof ndjson.parse>;
    out: ReturnType<typeof ndjson.stringify>;
  }
> = {};

async function dbLookup(
  db: level.LevelDB<any, any>,
  topicKey: Buffer,
  databaseId: string
) {
  const swarm = hyperswarm();

  swarm.join(topicKey, {
    lookup: true,
    announce: true,
  });

  swarm.on("connection", async (socket: any, info: any) => {
    const incoming = ndjson.parse();
    const outgoing = ndjson.stringify();
    socket.pipe(incoming);
    outgoing.pipe(socket);

    socket.databaseId = undefined;

    incoming.on("data", (data: PipeMessage) => {
      if (data.type === "handshake") {
        socket.databaseId = data.key;
        console.log("HANDSHAKE", data.key);
        idToSockets[data.key] = {
          in: incoming,
          out: outgoing,
        };
      }

      if (data.type === "put") {
        const parsed = parse(data.value);
        if (!parsed.err) {
          verifyMessage(parsed.value).then(() => {
            db.get(data.key)
              .then((d) => {
                const oldParsed = parse(d);
                if (oldParsed.value.timestamp < parsed.value.timestamp) {
                  db.put(data.key, data.value);
                }
              })
              .catch((e) => {});
            db.put(data.key, data.value);
          });
        }
      }

      if (data.type === "get") {
        db.get(data.key).then((d) => {
          outgoing.write({
            type: "put",
            key: data.key,
            value: d,
          } as PipePut);
        });
      }
    });

    if (info.client) {
      outgoing.write({
        type: "handshake",
        key: databaseId,
      } as PipeHandshake);
    }
  });

  swarm.on("disconnection", (socket: any, info: any) => {
    console.log(socket.databaseId + " disconnected.");
    if (socket.databaseId) {
      delete idToSockets[databaseId];
    }
  });
}

function relayToEveryone(msg: PipeMessage) {
  Object.values(idToSockets).forEach((obj) => {
    obj.out.write(msg);
  });
}

export default async function init() {
  // Announce this server
  const node = dht({
    ephemeral: true,
  });
  const keyHash = sha256(process.env.SWARM_KEY || "");
  const topicKey = Buffer.from(keyHash, "hex");
  node.announce(topicKey, { port: 4001 }, function (err: any) {
    if (err) throw err;
    console.log("Announced this server at " + keyHash);
  });

  // Set up database
  const levelDb = level(process.argv[3] || "level", { encoding: "utf8" });

  let databaseId = "";
  try {
    databaseId = await levelDb.get("_databaseId");
  } catch (e) {
    databaseId = sha256(`${new Date().getTime()}`);
    levelDb.put("_databaseId", databaseId);
  }

  // Set up swarm
  const topicDb = Buffer.from(sha256(process.env.DB_KEY || ""), "hex");
  dbLookup(levelDb, topicDb, databaseId);

  // Setup ToolChain
  const chain = new ToolDbService(true);
  if (global.crypto === undefined) {
    throw new Error(
      "webCrypto is not set up! Make sure you are on Node v15 or newer."
    );
  }

  chain.dbRead = (key: string) => {
    // console.log("dbRead", key);
    return new Promise((resolve, reject) => {
      levelDb
        .get(key)
        .then((d) => {
          // console.log("dbRead ok");
          resolve(parse(d).value);
        })
        .catch((e) => {
          // console.log("dbRead err, try socket");
          // Try to get from other Dbs connected to us
          relayToEveryone({
            type: "get",
            key,
          });
          setTimeout(() => {
            // console.log("Timeout resolve");
            levelDb
              .get(key)
              .then((d) => {
                // console.log("dbRead timeout", d);
                resolve(parse(d).value);
              })
              .catch((e) => {
                // console.log("dbRead timeout err");
                resolve(null as any);
              });
          }, 200);
        });
    });
  };

  chain.dbWrite = (key, msg) => {
    const m = ndjson.stringify(msg);
    return levelDb.put(key, m);
  };

  // Setup Express
  app.get(BASE_URI, (_req: any, res: any) => {
    res.json({ ok: true, msg: "You found the root!" });
  });

  console.log("Creating endpoints:");
  api.setup(app, chain);

  const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}.`);
  });

  // // Exit gracefully
  // function exitHandler(e: any) {
  //   console.error(e);
  //   server.close();
  //   process.exit();
  // }

  // process.on("exit", exitHandler);
  // process.on("SIGINT", exitHandler);
  // process.on("SIGUSR1", exitHandler);
  // process.on("SIGUSR2", exitHandler);
  // process.on("uncaughtException", exitHandler);
}

init();
