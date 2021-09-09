import { Express, Request } from "express";

import { ToolDbService, verifyMessage } from "tool-db";
import { BASE_URI } from "../constants";
import defaultResponse from "../responses/defaultResponse";
import statusResponse from "../responses/statusResponse";

const nodesPath = "api/nodes";

function setup(app: Express): void {
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
  [].map((p) => console.log(`- ${BASE_URI}${p}`));
}

export default {
  setup,
};
