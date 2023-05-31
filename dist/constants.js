"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SERVER_NAME = exports.SWARM_KEY = exports.USE_DHT = exports.DEBUG = exports.USE_HTTP = exports.PORT = void 0;
exports.PORT = process.env.PORT ? parseInt(process.env.PORT) : 8765;
exports.USE_HTTP = process.env.USE_HTTP || false;
exports.DEBUG = Boolean(process.env.DEBUG || false);
exports.USE_DHT = process.env.USE_DHT || false;
exports.SWARM_KEY = process.env.SWARM_KEY || "mtgatool-db-swarm-v4";
exports.SERVER_NAME = process.env.SERVER_NAME || "mtgatool-default-server";
//# sourceMappingURL=constants.js.map