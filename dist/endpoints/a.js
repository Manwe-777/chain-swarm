"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var user_1 = __importDefault(require("../schemas/user"));
var constants_1 = require("../constants");
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var defaultResponse_1 = __importDefault(require("../responses/defaultResponse"));
var loginPath = "auth/login";
var singupPath = "auth/signup";
function login(user, _email, password) {
    if (user && user.comparePassword(password)) {
        var payload = {
            check: true,
            owner: user.email,
            role: user.role,
        };
        var token = jsonwebtoken_1.default.sign(payload, constants_1.KEY, {
            // 7 days expiration
            expiresIn: 60 * 60 * 24 * 7,
        });
        return {
            msg: "Auth ok",
            ok: true,
            token: token,
            role: user.role,
            patreonTier: user.patreonTier,
            patreon: user.isPatreon(),
        };
    }
    else {
        return { msg: "User or password invalid.", ok: false };
    }
}
function setup(app, _db) {
    app.post(constants_1.BASE_URI + loginPath, function (req, res) {
        var email = req.body.email;
        var password = req.body.password;
        user_1.default.findOne({ email: email }, function (err, user) {
            var loginResult = login(user, email, password);
            res.json(loginResult);
        });
    });
    app.post(constants_1.BASE_URI + singupPath, function (req, res) {
        var email = req.body.email;
        var password = req.body.password;
        var user = new user_1.default({
            email: email,
            password: password,
            usersData: [],
            arenaIds: [],
            patreonTier: 0,
        });
        user.setRoles(constants_1.ROLE_USER);
        return user.save(function (err) {
            return (0, defaultResponse_1.default)(res, err, "You may now log in.");
        });
    });
    // Some output
    [loginPath, singupPath].map(function (p) { return console.log("- " + constants_1.BASE_URI + p); });
}
exports.default = {
    setup: setup,
};
//# sourceMappingURL=a.js.map