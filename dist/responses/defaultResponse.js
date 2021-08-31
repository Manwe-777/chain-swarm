"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var env_1 = __importDefault(require("../env"));
function defaultResponse(res, err, msg, ErrorCode) {
    if (ErrorCode === void 0) { ErrorCode = 500; }
    return err
        ? res.status(ErrorCode).json({
            ok: false,
            msg: env_1.default == "dev" ? err : err.message || "Internal error",
        })
        : res.status(200).json({ ok: true, msg: msg });
}
exports.default = defaultResponse;
//# sourceMappingURL=defaultResponse.js.map