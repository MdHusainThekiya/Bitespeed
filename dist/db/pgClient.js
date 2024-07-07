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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDatabase = exports.connectPostgresDB = exports.pool = void 0;
const pg_1 = __importDefault(require("pg"));
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("../helper/logger"));
const connectPostgresDB = () => __awaiter(void 0, void 0, void 0, function* () {
    exports.pool = new pg_1.default.Pool(config_1.default.db.connectionString ? {
        connectionString: config_1.default.db.connectionString,
    } : {
        host: config_1.default.db.host,
        port: config_1.default.db.port,
        user: config_1.default.db.user,
        password: config_1.default.db.password,
        database: config_1.default.db.database,
    });
    yield exports.pool.connect();
    (0, logger_1.default)({ log: 'PG_CLIENT_CONNECTED_SUCCESSFULLY' });
});
exports.connectPostgresDB = connectPostgresDB;
const createDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield exports.pool.query('SELECT datname FROM pg_catalog.pg_database WHERE datname = $1', [config_1.default.db.database]);
    if (!result || result.rowCount !== 1) {
        yield exports.pool.query('CREATE DATABASE $1', [config_1.default.db.database]);
    }
    (0, logger_1.default)({ log: 'DATABASE_IS_READY', database: config_1.default.db.database });
});
exports.createDatabase = createDatabase;
exports.default = pg_1.default;
//# sourceMappingURL=pgClient.js.map