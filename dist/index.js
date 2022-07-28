"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var swarmStart_1 = __importDefault(require("./swarmStart"));
// import webrtcServer from "./webrtcServer";
// Regular server, for websocket connections, with DHT server peers discovery.
(0, swarmStart_1.default)();
// // WebRtc server, it will only connect with other webrtc instances.
// webrtcServer();
//# sourceMappingURL=index.js.map