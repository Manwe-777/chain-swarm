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
var dht_1 = __importDefault(require("@hyperswarm/dht"));
var constants_1 = require("./constants");
var api_1 = __importDefault(require("./endpoints/api"));
var gun_1 = __importDefault(require("gun"));
dotenv_1.default.config();
var app = express_1.default();
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
app.use(gun_1.default.serve);
var allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3006",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3006",
    "http://mtgatool.com/",
];
app.use(cors_1.default({
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
function init() {
    return __awaiter(this, void 0, void 0, function () {
        var node, keyHash, topicKey, server, gun;
        return __generator(this, function (_a) {
            node = dht_1.default({
                ephemeral: true,
            });
            keyHash = tool_db_1.sha256(process.env.SWARM_KEY || "");
            topicKey = Buffer.from(keyHash, "hex");
            node.announce(topicKey, { port: 4000 }, function (err) {
                if (err)
                    throw err;
                console.log("Announced this server at " + keyHash);
            });
            // Setup Express
            app.get(constants_1.BASE_URI, function (_req, res) {
                res.json({ ok: true, msg: "You found the root!" });
            });
            console.log("Creating endpoints:");
            api_1.default.setup(app);
            server = app.listen(constants_1.PORT, function () {
                console.log("Relay peer started on port " + constants_1.PORT + "/gun");
            });
            tool_db_1.customGun(gun_1.default);
            gun = gun_1.default({ web: server, file: "data" });
            return [2 /*return*/];
        });
    });
}
exports.default = init;
init();
//# sourceMappingURL=index.js.map