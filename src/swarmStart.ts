import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { ToolDb } from "tool-db";
import dotenv from "dotenv";
import publicIp from "public-ip";
import fs from "fs";
import http from "http";
import https from "https";

import Libp2p from "libp2p";
import Websockets from "libp2p-websockets";
import { NOISE } from "libp2p-noise";
import Mplex from "libp2p-mplex";
import Bootstrap from "libp2p-bootstrap";
import DHT from "libp2p-kad-dht";

dotenv.config();

// This is a bad solution but will help connecting to basically any peer
(process as any).env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

import { USE_DHT, USE_HTTP, PORT } from "./constants";

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

const knownHosts: Record<string, string> = {
  "66.97.46.144": "api.mtgatool.com",
};

export default async function swarmStart() {
  console.log("USE_DHT ", USE_DHT);
  console.log("USE_HTTP ", USE_HTTP);
  console.log("PORT ", PORT);

  const libp2p = await Libp2p.create({
    addresses: {
      // Add the signaling server address, along with our PeerId to our multiaddrs list
      // libp2p will automatically attempt to dial to the signaling server so that it can
      // receive inbound connections from other peers
      listen: [],
    },
    modules: {
      transport: [Websockets],
      streamMuxer: [Mplex],
      connEncryption: [NOISE],
      peerDiscovery: [Bootstrap],
      dht: DHT,
    },
    config: {
      peerDiscovery: {
        bootstrap: {
          list: [
            "/dns4/haciendas.chat.ddataa.org/tcp/443/wss/p2p-webrtc-star/p2p/QmWjz6xb8v9K4KnYEwP5Yk75k5mMBCehzWFLCvvQpYxF3d",
          ],
        },
      },
      dht: {
        // The DHT options (and defaults) can be found in its documentation
        kBucketSize: 20,
        enabled: true,
        randomWalk: {
          enabled: true, // Allows to disable discovery (enabled by default)
          interval: 300e3,
          timeout: 10e3,
        },
      },
    },
  });

  // Listen for new peers
  libp2p.on("peer:discovery", (peerId) => {
    console.log(`Found peer ${peerId.toB58String()}`);
  });

  // Listen for new connections to peers
  libp2p.connectionManager.on("peer:connect", (connection) => {
    console.log(`Connected to ${connection.remotePeer.toB58String()}`);
  });

  // Listen for peers disconnecting
  libp2p.connectionManager.on("peer:disconnect", (connection) => {
    console.log(`Disconnected from ${connection.remotePeer.toB58String()}`);
  });

  await libp2p.start();

  ////////
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
            server: true,
            port: undefined,
            debug: true,
          }
        : {
            httpServer: undefined,
            server: true,
            port: PORT,
            debug: true,
          }
    );

    // Setup Express
    app.get("/", (_req: any, res: any) => {
      res.json({ ok: true, msg: "You found the root!" });
    });

    app.get("/peers", (_req: any, res: any) => {
      res.json({ peers: toolDb.websockets.activePeers });
    });

    /*
    var channel = DC();
    if (USE_DHT) {
      console.log("Joining dht", process.env.SWARM_KEY);
      channel.join(process.env.SWARM_KEY, PORT);
    } else {
      console.log("Listening dht", process.env.SWARM_KEY);
      channel.join(process.env.SWARM_KEY);
    }

    channel.on("peer", (_id: any, peer: any) => {
      console.log("DHT Peer ", peer.host, peer.port);
      if (currentIp !== peer.host) {
        const finalHost = knownHosts[peer.host] ?? peer.host;
        if (!toolDb.websockets.allPeers.includes(finalHost)) {
          toolDb.websockets.open(
            `http${peer.port === 443 ? "s" : ""}://${finalHost}:${
              peer.port === 443 ? "" : peer.port
            }`
          );
        }
      }
    });
    */
  });
}
