"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function statusResponse(res, status, msg, ok) {
    if (ok === void 0) { ok = false; }
    return res.status(status).json({ ok: ok, msg: msg });
}
exports.default = statusResponse;
//# sourceMappingURL=statusResponse.js.map