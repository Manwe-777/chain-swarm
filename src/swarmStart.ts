import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import cors from "cors";
import { ToolDb, ToolDbNetwork, loadKeysComb } from "mtgatool-db";
import dotenv from "dotenv";
import publicIp from "public-ip";
import fs from "fs";
import http from "http";
import https from "https";

dotenv.config();

// This is a bad solution but will help connecting to basically any peer
(process as any).env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

import {
  USE_DHT,
  USE_HTTP,
  PORT,
  SWARM_KEY,
  SERVER_NAME,
  SERVER_HOSTNAME,
  DEBUG,
} from "./constants";
import expressSetup from "./expressSetup";

const DC = require("discovery-channel");

dotenv.config();
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var allowedOrigins = ["http://localhost:3000", "http://localhost:3006"];

const keys = JSON.parse(fs.readFileSync("keys.json", "utf8"));

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
  console.log("SERVER NAME: ", SERVER_NAME);
  console.log("SERVER_HOSTNAME: ", SERVER_HOSTNAME);
  console.log("USE_DHT ", USE_DHT);
  console.log("USE_HTTP ", USE_HTTP);

  publicIp.v4().then((currentIp) => {
    loadKeysComb(keys).then(async (defaultKeys) => {
      if (defaultKeys === undefined) {
        console.log("Failed to load keys");
        return;
      }

      console.log(new Date().toUTCString());
      console.log("Server IP: ", currentIp);
      console.log("Port: ", PORT);

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
              ssl: true,
              server: true,
              debug: DEBUG,
              topic: SWARM_KEY,
              serverName: SERVER_NAME,
              host: SERVER_HOSTNAME || currentIp,
              port: undefined,
              defaultKeys: defaultKeys.signKeys,
            }
          : {
              httpServer: httpsServer,
              ssl: false,
              server: true,
              debug: DEBUG,
              topic: SWARM_KEY,
              serverName: SERVER_NAME,
              host: SERVER_HOSTNAME || currentIp,
              port: PORT,
              defaultKeys: defaultKeys.signKeys,
            }
      );

      toolDb.on("init", (id) => {
        console.log("Server started");
        console.log("Public Key: ", id);
      });

      // Gets the latest ranks from the latest month only
      // This function is meant to speed up the home page loading.
      // It should probably be cached here so we avoid repeated store queries here.
      toolDb.addServerFunction("getLatestRanks", () => {
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);

        return new Promise<string>((resolve, reject) => {
          toolDb.store
            .query("rank-MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE")
            .then((keys) => {
              if (keys.length === 0) resolve(JSON.stringify([]));
              else {
                const ranks: any = [];
                let count = 0;
                keys.forEach((key) => {
                  toolDb.store.get(key, (err, value) => {
                    if (!value) return;

                    let parsed = undefined;
                    try {
                      parsed = JSON.parse(value);
                    } catch (e) {
                      return;
                    }

                    count++;
                    ranks.push(parsed.v);
                    if (count === keys.length) {
                      // it should also filter the best ones on each ladder
                      // though that is more typescript-sensitive
                      const filtered = ranks.filter(
                        (rank: any) => rank.updated > firstDay.getTime()
                      );
                      resolve(filtered);
                    }
                  });
                });
              }
            });
        });
      });

      // Gets the latest 10 matches for this player using his pubkey
      toolDb.addServerFunction<string, string>("getLatestMatches", (str) => {
        const args = JSON.parse(str);
        const { pubKey, items } = args;

        return new Promise<string>((resolve, reject) => {
          if (!pubKey) resolve(JSON.stringify([]));
          else {
            toolDb.store
              .query(`:${pubKey}.matches-`)
              .then((keys) => {
                if (keys.length === 0) resolve(JSON.stringify([]));
                else {
                  const matches: any[] = [];
                  let count = 0;
                  keys.forEach((key) => {
                    toolDb.store.get(key, (err, value) => {
                      if (!value) return;

                      let parsed = undefined;
                      try {
                        parsed = JSON.parse(value);
                      } catch (e) {
                        return;
                      }

                      count++;
                      matches.push(parsed.v);
                      if (count === keys.length) {
                        // it should also filter the best ones on each ladder
                        // though that is more typescript-sensitive
                        const filtered = matches
                          .filter((match) => match.timestamp)
                          .sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1))
                          .slice(0, items || 10);
                        resolve(filtered as any);
                      }
                    });
                  });
                }
              })
              .catch((e) => {
                resolve(JSON.stringify([]));
              });
          }
        });
      });

      // You should be able to provide your own server user or keys!
      toolDb.anonSignIn();

      // Setup Express
      expressSetup(app, toolDb);

      var channel = DC();
      if (USE_DHT) {
        console.log("Joining swarm " + SWARM_KEY);
        channel.join(SWARM_KEY, PORT);
      } else {
        // channel.join(SWARM_KEY);
      }

      const checkedPeers: string[] = [currentIp];

      channel.on("peer", (_id: any, peer: any) => {
        if (!checkedPeers.includes(peer.host)) {
          console.log("DHT Peer ", peer.host, peer.port);
          if (currentIp !== peer.host) {
            console.log("Checking peer ", peer.host);
            axios
              .get(`http${peer.port === 443 ? "s" : ""}://${peer.host}/pubkey`)
              .then((resp) => {
                console.log(peer.host + "/pubkey response; ", resp.data);

                try {
                  const data = JSON.parse(resp.data.toString());
                  if (data.pubkey) {
                    (toolDb.network as ToolDbNetwork).connectTo(data.pubkey);
                  }
                } catch (e) {
                  // couldnt parse pubkey
                }
              })
              .catch((e) => {
                console.log("Failed to get pubkey from peer ", peer.host);
              });
          }
          checkedPeers.push(peer.host);
        }
      });
    });
  });
}
