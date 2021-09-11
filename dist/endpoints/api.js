"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("../constants");
var testPath = "test";
function setup(app) {
    // app.get(BASE_URI + keyPath, async (req, res) => {
    //   const diffFeed = await bee.getDiff();
    //   const diffFeefKey = diffFeed.feed.key.toString("hex");
    //   res.json({ key: diffFeefKey });
    // });
    app.get(constants_1.BASE_URI + testPath, function (req, res) {
        console.log("Test endpoint");
        res.json({ time: new Date().getTime() });
    });
    // Some output
    [testPath].map(function (p) { return console.log("- " + constants_1.BASE_URI + p); });
}
exports.default = {
    setup: setup,
};
//# sourceMappingURL=api.js.map