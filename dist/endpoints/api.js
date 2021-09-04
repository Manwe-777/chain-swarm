"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var tool_db_1 = require("tool-db");
var constants_1 = require("../constants");
var defaultResponse_1 = __importDefault(require("../responses/defaultResponse"));
var statusResponse_1 = __importDefault(require("../responses/statusResponse"));
var putPath = "api/put";
var getPath = "api/get";
var nodesPath = "api/nodes";
var keyPath = "api/key";
function setup(app, chain) {
    app.post(constants_1.BASE_URI + putPath, function (req, res) {
        chain
            .messageWrapper(req.body)
            .then(function () { return defaultResponse_1.default(res, false, "Updated sucessfully"); })
            .catch(function (e) {
            statusResponse_1.default(res, 500, e.message);
        });
    });
    app.get(constants_1.BASE_URI + getPath, function (req, res) {
        console.log("API get = " + req.query.key);
        try {
            chain
                .dbRead(decodeURIComponent(req.query.key))
                .then(function (data) {
                console.log(req.query.key, data);
                if (!data) {
                    res.json(null);
                }
                else {
                    tool_db_1.verifyMessage(data)
                        .then(function () {
                        res.json(data || null);
                    })
                        .catch(function (ve) {
                        statusResponse_1.default(res, 500, ve.message);
                    });
                }
            })
                .catch(function (e) {
                statusResponse_1.default(res, 500, e.message);
            });
        }
        catch (e) {
            console.error(e);
        }
    });
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
    [putPath, getPath, nodesPath].map(function (p) { return console.log("- " + constants_1.BASE_URI + p); });
}
exports.default = {
    setup: setup,
};
//# sourceMappingURL=api.js.map