"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const getStandaredDateTime = (value) => {
    if (value && value !== "") {
        return (0, moment_1.default)(value).format('YYYY-MM-DD HH:mm:ss.SSSZ');
    }
    else {
        return (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss.SSSZ');
    }
};
exports.default = {
    getStandaredDateTime
};
//# sourceMappingURL=util.js.map