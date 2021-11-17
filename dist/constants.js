"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USE_DHT = exports.USE_HTTP = exports.PORT = void 0;
exports.PORT = process.env.PORT ? parseInt(process.env.PORT) : 8765;
exports.USE_HTTP = process.env.USE_HTTP === "true";
exports.USE_DHT = process.env.USE_DHT === "true";
//# sourceMappingURL=constants.js.map