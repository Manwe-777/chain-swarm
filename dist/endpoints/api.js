"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("../constants");
var nodesPath = "api/nodes";
function setup(app) {
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
    [].map(function (p) { return console.log("- " + constants_1.BASE_URI + p); });
}
exports.default = {
    setup: setup,
};
//# sourceMappingURL=api.js.map