"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function notAuthResponse(res) {
    return res
        .status(401)
        .json({ ok: false, msg: "You dont have permissions to do this!" });
}
exports.default = notAuthResponse;
//# sourceMappingURL=notAuthResponse.js.map