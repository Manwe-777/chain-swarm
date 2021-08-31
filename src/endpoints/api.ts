import { Express, Request } from "express";

import { ToolChainService } from "tool-chain";
import { BASE_URI } from "../constants";
import defaultResponse from "../responses/defaultResponse";
import statusResponse from "../responses/statusResponse";

const putPath = "api/put";
const getPath = "api/get";
const nodesPath = "api/nodes";

function setup(app: Express, chain: ToolChainService): void {
  app.post(BASE_URI + putPath, (req, res) => {
    console.log("body", req.body);
    chain
      .messageWrapper(req.body)
      .then(() => defaultResponse(res, undefined, "Updated sucessfully"))
      .catch((e) => {
        statusResponse(res, 500, e.message);
      });
  });

  app.get(
    BASE_URI + getPath,
    (req: Request<any, any, any, { key: string }>, res) => {
      chain
        .dbRead(req.query.key)
        .then((data: any) => res.json(data?.value || null))
        .catch((e) => {
          statusResponse(res, 500, e.message);
        });
    }
  );

  app.get(BASE_URI + nodesPath, (req, res) => {
    res.json({ message: "Not implemented YET" });
  });
  // Some output
  [putPath, getPath, nodesPath].map((p) => console.log(`- ${BASE_URI}${p}`));
}

export default {
  setup,
};
