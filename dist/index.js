"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var cors_1 = __importDefault(require("cors"));
var tool_db_1 = require("tool-db");
var dotenv_1 = __importDefault(require("dotenv"));
var hyperspace_1 = require("hyperspace");
var hyperbee_1 = __importDefault(require("hyperbee"));
var constants_1 = require("./constants");
var api_1 = __importDefault(require("./endpoints/api"));
dotenv_1.default.config();
var app = (0, express_1.default)();
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
var allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3006",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3006",
    "http://mtgatool.com/",
];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // allow requests with no origin
        // (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = "The CORS policy for this site does not " +
                "allow access from the specified Origin.";
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
}));
function setupHyperspace() {
    return __awaiter(this, void 0, void 0, function () {
        var client, server, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 5]);
                    client = new hyperspace_1.Client();
                    return [4 /*yield*/, client.ready()];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 2:
                    e_1 = _a.sent();
                    // no daemon, start it in-process
                    server = new hyperspace_1.Server();
                    return [4 /*yield*/, server.ready()];
                case 3:
                    _a.sent();
                    client = new hyperspace_1.Client();
                    return [4 /*yield*/, client.ready()];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/, {
                        client: client,
                        cleanup: function () {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, client.close()];
                                        case 1:
                                            _a.sent();
                                            if (!server) return [3 /*break*/, 3];
                                            console.log("Shutting down Hyperspace, this may take a few seconds...");
                                            return [4 /*yield*/, server.stop()];
                                        case 2:
                                            _a.sent();
                                            _a.label = 3;
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            });
                        },
                    }];
            }
        });
    });
}
function init() {
    return __awaiter(this, void 0, void 0, function () {
        // Exit gracefully
        function exitHandler(e) {
            console.error(e);
            cleanup();
            server.close();
            process.exit();
        }
        var _a, client, cleanup, _b, _c, _d, bufferKey, core, bee, _e, _f, chain, server;
        var _this = this;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0: return [4 /*yield*/, setupHyperspace()];
                case 1:
                    _a = _g.sent(), client = _a.client, cleanup = _a.cleanup;
                    _c = (_b = console).log;
                    _d = ["status"];
                    return [4 /*yield*/, client.status()];
                case 2:
                    _c.apply(_b, _d.concat([_g.sent()]));
                    bufferKey = Buffer.from(process.env.KEY || "", "hex");
                    core = client.corestore().get({ key: bufferKey });
                    bee = new hyperbee_1.default(core, {
                        keyEncoding: "utf-8",
                        valueEncoding: "json", // same options as above
                    });
                    _f = (_e = console).log;
                    return [4 /*yield*/, bee.status];
                case 3:
                    _f.apply(_e, [_g.sent()]);
                    client.replicate(bee.feed);
                    chain = new tool_db_1.ToolDbService(true);
                    if (global.crypto === undefined) {
                        throw new Error("webCrypto is not set up! Make sure you are on Node v15 or newer.");
                    }
                    chain.dbInit = function () { };
                    chain.dbRead = function (key) { return __awaiter(_this, void 0, void 0, function () {
                        var val;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, bee.get(key)];
                                case 1:
                                    val = _a.sent();
                                    return [2 /*return*/, val ? val.value : null];
                            }
                        });
                    }); };
                    chain.dbWrite = function (key, msg) {
                        return bee.put(Buffer.from(key), msg);
                    };
                    // Setup Express
                    app.get(constants_1.BASE_URI, function (_req, res) {
                        res.json({ ok: true, msg: "You found the root!" });
                    });
                    console.log("Creating endpoints:");
                    api_1.default.setup(app, chain);
                    server = app.listen(constants_1.PORT, function () {
                        console.log("Server listening on port " + constants_1.PORT + ".");
                    });
                    process.on("exit", exitHandler);
                    process.on("SIGINT", exitHandler);
                    process.on("SIGUSR1", exitHandler);
                    process.on("SIGUSR2", exitHandler);
                    process.on("uncaughtException", exitHandler);
                    return [2 /*return*/];
            }
        });
    });
}
exports.default = init;
init();
//# sourceMappingURL=index.js.map