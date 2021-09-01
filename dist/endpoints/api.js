"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("../constants");
var defaultResponse_1 = __importDefault(require("../responses/defaultResponse"));
var statusResponse_1 = __importDefault(require("../responses/statusResponse"));
var putPath = "api/put";
var getPath = "api/get";
var nodesPath = "api/nodes";
function setup(app, chain, bee) {
    app.post(constants_1.BASE_URI + putPath, function (req, res) {
        console.log("body", req.body);
        chain
            .messageWrapper(req.body)
            .then(function () { return (0, defaultResponse_1.default)(res, undefined, "Updated sucessfully"); })
            .catch(function (e) {
            (0, statusResponse_1.default)(res, 500, e.message);
        });
    });
    app.get(constants_1.BASE_URI + getPath, function (req, res) {
        chain
            .dbRead(req.query.key)
            .then(function (data) { return res.json((data === null || data === void 0 ? void 0 : data.value) || null); })
            .catch(function (e) {
            (0, statusResponse_1.default)(res, 500, e.message);
        });
    });
    app.get(constants_1.BASE_URI + nodesPath, function (req, res) {
        var peers = bee.feed.peers.map(function (d) { return d.remoteAddress; });
        res.json({ peers: peers });
    });
    // Some output
    [putPath, getPath, nodesPath].map(function (p) { return console.log("- " + constants_1.BASE_URI + p); });
}
exports.default = {
    setup: setup,
};
//# sourceMappingURL=api.js.map