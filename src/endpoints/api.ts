import { Express, Request } from "express";

import { ToolDbService, verifyMessage } from "tool-db";
import { BASE_URI } from "../constants";
import defaultResponse from "../responses/defaultResponse";
import statusResponse from "../responses/statusResponse";

const putPath = "api/put";
const getPath = "api/get";
const nodesPath = "api/nodes";
const keyPath = "api/key";

function setup(app: Express, chain: ToolDbService): void {
  app.post(BASE_URI + putPath, (req, res) => {
    chain
      .messageWrapper(req.body)
      .then(() => defaultResponse(res, false, "Updated sucessfully"))
      .catch((e) => {
        statusResponse(res, 500, e.message);
      });
  });

  app.get(
    BASE_URI + getPath,
    (req: Request<any, any, any, { key: string }>, res) => {
      console.log("API get = " + req.query.key);
      try {
        chain
          .dbRead<any>(decodeURIComponent(req.query.key))
          .then((data: any) => {
            console.log(req.query.key, data);
            if (!data) {
              res.json(null);
            } else {
              verifyMessage(data)
                .then(() => {
                  res.json(data || null);
                })
                .catch((ve) => {
                  statusResponse(res, 500, ve.message);
                });
            }
          })
          .catch((e) => {
            statusResponse(res, 500, e.message);
          });
      } catch (e) {
        console.error(e);
      }
    }
  );

  // app.get(BASE_URI + keyPath, async (req, res) => {
  //   const diffFeed = await bee.getDiff();
  //   const diffFeefKey = diffFeed.feed.key.toString("hex");
  //   res.json({ key: diffFeefKey });
  // });

  // app.get(BASE_URI + nodesPath, (req, res) => {
  //   const peers = bee.feed.peers.map((d: any) => d.remoteAddress);
  //   res.json({ peers });
  // });

  // Some output
  [putPath, getPath, nodesPath].map((p) => console.log(`- ${BASE_URI}${p}`));
}

export default {
  setup,
};
