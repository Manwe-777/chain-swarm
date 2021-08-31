"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var hyperswarm_1 = __importDefault(require("hyperswarm"));
var stream_1 = require("stream");
var tool_chain_1 = require("tool-chain");
var channel_1 = __importDefault(require("./channel"));
var crypto_1 = __importDefault(require("crypto"));
var peer_1 = __importDefault(require("./peer"));
var Swarm = /** @class */ (function (_super) {
    __extends(Swarm, _super);
    function Swarm(opts) {
        if (opts === void 0) { opts = {}; }
        var _this = _super.call(this) || this;
        _this.swarm = opts.swarm || (0, hyperswarm_1.default)(opts);
        _this.channels = new Set();
        _this.handleConnection = _this.handleConnection.bind(_this);
        _this.swarm.on("connection", _this.handleConnection);
        return _this;
    }
    Swarm.prototype.handleConnection = function (connection, info) {
        // console.log("handleConnection", info);
        var peer = new peer_1.default(connection, info);
        this.emit("peer", peer);
    };
    Swarm.prototype.channel = function (name) {
        var _this = this;
        var _channel = new channel_1.default(this, (0, tool_chain_1.sha256)(name), name);
        var bufferKey = crypto_1.default.createHash("sha256").update(name).digest();
        this.swarm.join(bufferKey, {
            announce: true,
            lookup: true,
        });
        this.emit("channel", _channel);
        _channel.once("closed", function () {
            _this.swarm.leave(bufferKey);
        });
        return _channel;
    };
    Swarm.prototype.destroy = function (cb) {
        this.swarm.removeListener("connection", this.handleConnection);
        this.swarm.destroy(cb);
        this.emit("destroyed");
    };
    return Swarm;
}(stream_1.EventEmitter));
exports.default = Swarm;
//# sourceMappingURL=swarm.js.map