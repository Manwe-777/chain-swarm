import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { customGun, sha256 } from "tool-db";
import dotenv from "dotenv";
import DHT from "@hyperswarm/dht";
import net from "net";
import pump from "pump";

import crypto from "crypto";
import swarm from "@geut/discovery-swarm-webrtc";

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

export default async function swarmStart() {
  /**
   * DHT Hole punching
   * requires clients to be in Node
   * Bridges connections to Gun
   */
  // const keyHash = sha256(process.env.SWARM_KEY || "");
  // const topicKey = Buffer.from(keyHash, "hex");
  // const keyPair = DHT.keyPair(topicKey);

  // const node = new DHT();

  // const nodeServer = node.createServer();
  // nodeServer.on("connection", function (socket: any) {
  //   console.log("Remote key", socket.remotePublicKey.toString("hex"));
  //   let local = net.connect(PORT, "localhost");
  //   pump(socket, local, socket);
  // });

  // await nodeServer.listen(keyPair);

  // const strKey = keyPair.publicKey.toString("hex");
  // console.log("Topic: ", nodeServer.target.toString("hex"));
  // console.log("Public key: " + strKey);
  // console.log("DHT server OK:");
  // console.log(nodeServer.address());

  const sw = swarm({
    bootstrap: ["wss://geut-webrtc-signal-v3.herokuapp.com"],
  });

  const topic = crypto
    .createHash("sha256")
    .update("mtgatool-webrtc-test")
    .digest();

  console.log("ID > ", sw.id.toString("hex"));
  console.log(
    "topic",
    crypto.createHash("sha256").update("mtgatool-webrtc-test").digest("hex")
  );

  sw.join(topic);

  sw.on("connection", (peer: any, info: any) => {
    console.log("connection", peer, info);
  });

  // sw.on("connection-closed", (connection: any, info: any) => {
  //   console.log("connection-closed", connection, info);
  // });

  // sw.on("leave", (channel: any) => {
  //   console.log("leave", channel);
  // });

  // sw.on("close", () => {
  //   console.log("close");
  // });

  // sw.on("candidates-updated", (channel: any, candidates: any) => {
  //   console.log(
  //     "candidates-updated",
  //     channel.toString("hex"),
  //     candidates.map((h: any) => h.toString("hex"))
  //   );
  // });

  // Setup Express
  app.get("/", (_req: any, res: any) => {
    res.json({ ok: true, msg: "You found the root!" });
  });

  const server = app.listen(PORT, () => {
    console.log("Relay peer started on port " + PORT + "/gun");
  });

  customGun(Gun);
  Gun({ web: server, file: "data" });
}
