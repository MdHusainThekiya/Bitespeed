"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../.env') });
const config = {
    service: {
        port: Number(process.env.PORT) || 4040,
        enableLogs: process.env.ENABLE_LOGS ? (process.env.ENABLE_LOGS).trim().toString().toLowerCase() === "true" ? true : false : true,
        allowedLogLevels: process.env.ALLOWED_LOG_LEVELS ? (process.env.ALLOWED_LOG_LEVELS).trim().toString().split(",") : ['all'],
        enableLogLocation: process.env.ENABLE_LOG_LOCATION ? (process.env.ENABLE_LOG_LOCATION).trim().toString().toLowerCase() === "true" ? true : false : false
    },
    db: {
        host: ((_a = (process.env.POSTGRES_HOST)) === null || _a === void 0 ? void 0 : _a.trim().toString()) || "0.0.0.0",
        port: Number(process.env.POSTGRES_PORT) || 5432,
        user: ((_b = (process.env.POSTGRES_USER)) === null || _b === void 0 ? void 0 : _b.trim().toString()) || "defaultUser",
        password: ((_c = (process.env.POSTGRES_PASSWORD)) === null || _c === void 0 ? void 0 : _c.trim().toString()) || "defaultPassword",
        database: ((_d = (process.env.POSTGRES_DB_NAME)) === null || _d === void 0 ? void 0 : _d.trim().toString()) || "defaultDB",
        connectionString: ((_e = (process.env.POSTGRES_URL)) === null || _e === void 0 ? void 0 : _e.trim().toString()) || null,
    }
};
exports.default = config;
//# sourceMappingURL=config.js.map