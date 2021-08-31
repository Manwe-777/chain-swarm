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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
var stream_1 = require("stream");
var Channel = /** @class */ (function (_super) {
    __extends(Channel, _super);
    function Channel(swarm, key, name) {
        var _this = _super.call(this) || this;
        _this.name = "";
        _this.key = "";
        _this.swarm = null;
        _this.peers = new Set();
        _this.name = name;
        _this.key = key;
        _this.swarm = swarm;
        _this.handlePeer = _this.handlePeer.bind(_this);
        _this.swarm.on("peer", _this.handlePeer);
        return _this;
    }
    Channel.prototype.handlePeer = function (peer) {
        var _this = this;
        peer.once("channel", function (channel) {
            console.log(channel, _this.key);
            if (channel === _this.key) {
                _this.addPeer(peer);
            }
        });
    };
    Channel.prototype.addPeer = function (peer) {
        var _this = this;
        this.peers.add(peer);
        this.emit("peer", peer);
        peer.once("disconnected", function () {
            _this.peers.delete(peer);
            _this.emit("peer-disconnected", peer);
        });
        peer.on("message", function (data) {
            _this.emit("message", peer, data);
        });
    };
    Channel.prototype.send = function (message) {
        this.broadcast({
            type: "message",
            message: message,
        });
    };
    Channel.prototype.broadcast = function (data) {
        var e_1, _a;
        try {
            for (var _b = __values(this.peers), _c = _b.next(); !_c.done; _c = _b.next()) {
                var peer = _c.value;
                peer.send(data);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    Channel.prototype.close = function () {
        var e_2, _a;
        if (this.swarm) {
            this.swarm.removeListener("peer", this.handlePeer);
        }
        try {
            for (var _b = __values(this.peers), _c = _b.next(); !_c.done; _c = _b.next()) {
                var peer = _c.value;
                peer.destroy();
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        this.emit("closed");
        this.swarm = null;
    };
    return Channel;
}(stream_1.EventEmitter));
exports.default = Channel;
//# sourceMappingURL=channel.js.map