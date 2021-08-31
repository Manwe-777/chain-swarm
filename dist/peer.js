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
var stream_1 = require("stream");
var ndjson_1 = __importDefault(require("ndjson"));
var Peer = /** @class */ (function (_super) {
    __extends(Peer, _super);
    function Peer(connection, info) {
        var _this = _super.call(this) || this;
        _this.incoming = ndjson_1.default.parse();
        _this.outgoing = ndjson_1.default.stringify();
        var peer = info.peer;
        _this.connection = connection;
        connection.pipe(_this.incoming);
        _this.outgoing.pipe(connection);
        _this.incoming.on("data", function (data) {
            console.log("data", data);
            _this.emit("data", data);
            var type = data.type;
            _this.emit(type, data);
        });
        _this.connection.on("error", function (e) {
            _this.emit("connection-error", e);
        });
        _this.connection.once("close", function () {
            _this.emit("disconnected");
        });
        if (peer && peer.topic) {
            var channel_1 = peer.topic.toString("hex");
            _this.send({
                type: "handshake",
                channel: channel_1,
            });
            setTimeout(function () {
                _this.emit("channel", channel_1);
            }, 0);
        }
        else {
            _this.once("handshake", function (_a) {
                var channel = _a.channel;
                _this.send({
                    type: "handshake",
                    channel: channel,
                });
                _this.emit("channel", channel);
            });
        }
        return _this;
    }
    Peer.prototype.send = function (data) {
        this.outgoing.write(data);
    };
    Peer.prototype.destroy = function () {
        this.connection.end();
    };
    return Peer;
}(stream_1.EventEmitter));
exports.default = Peer;
//# sourceMappingURL=peer.js.map