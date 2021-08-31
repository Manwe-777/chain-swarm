import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { ToolDbService } from "tool-db";
import dotenv from "dotenv";

import {
  Client as HyperspaceClient,
  Server as HyperspaceServer,
} from "hyperspace";

import Hyperbee from "hyperbee";

import { PORT, BASE_URI } from "./constants";
import api from "./endpoints/api";

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

async function setupHyperspace() {
  let client: any;
  let server: any;

  try {
    client = new HyperspaceClient();
    await client.ready();
  } catch (e) {
    // no daemon, start it in-process
    server = new HyperspaceServer();
    await server.ready();
    client = new HyperspaceClient();
    await client.ready();
  }

  return {
    client,
    async cleanup() {
      await client.close();
      if (server) {
        console.log("Shutting down Hyperspace, this may take a few seconds...");
        await server.stop();
      }
    },
  };
}

export default async function init() {
  // Setup Hyperswarm with Hypercore
  const { client, cleanup } = await setupHyperspace();
  console.log("status", await client.status());

  const bufferKey = Buffer.from(process.env.KEY || "", "hex");

  const core = client.corestore().get({ key: bufferKey });
  const bee = new Hyperbee(core, {
    keyEncoding: "utf-8", // can be set to undefined (binary), utf-8, ascii or and abstract-encoding
    valueEncoding: "json", // same options as above
  });

  console.log(await bee.status);

  client.replicate(bee.feed);

  // Setup ToolChain
  const chain = new ToolDbService(true);
  if (global.crypto === undefined) {
    throw new Error(
      "webCrypto is not set up! Make sure you are on Node v15 or newer."
    );
  }
  chain.dbInit = () => {};

  chain.dbRead = async (key) => {
    const val = await bee.get(key);
    return val ? val.value : null;
  };

  chain.dbWrite = (key, msg) => {
    return bee.put(Buffer.from(key), msg);
  };

  // Setup Express
  app.get(BASE_URI, (_req, res) => {
    res.json({ ok: true, msg: "You found the root!" });
  });

  console.log("Creating endpoints:");
  api.setup(app, chain);

  const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}.`);
  });

  // Exit gracefully
  function exitHandler(e: any) {
    console.error(e);
    cleanup();
    server.close();
    process.exit();
  }

  process.on("exit", exitHandler);
  process.on("SIGINT", exitHandler);
  process.on("SIGUSR1", exitHandler);
  process.on("SIGUSR2", exitHandler);
  process.on("uncaughtException", exitHandler);
}

init();
