"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SWARM_KEY = exports.USE_DHT = exports.USE_HTTP = exports.PORT = void 0;
exports.PORT = process.env.PORT ? parseInt(process.env.PORT) : 8765;
exports.USE_HTTP = process.env.USE_HTTP || false;
exports.USE_DHT = process.env.USE_DHT || false;
exports.SWARM_KEY = process.env.SWARM_KEY || "tool-db-default";
//# sourceMappingURL=constants.js.map