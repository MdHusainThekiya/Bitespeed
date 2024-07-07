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
const express_1 = __importDefault(require("express"));
const config_1 = __importDefault(require("./config"));
const logger_1 = __importDefault(require("./helper/logger"));
const pgClient_1 = require("./db/pgClient");
const pgTablesMigration_1 = __importDefault(require("./db/pgTablesMigration"));
const routes_1 = __importDefault(require("./routes/routes"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get('/', (req, res) => { res.send("<b>Hello World!</b>"); });
/** ROUTES ARE DEFINED IN ./routes/routes.ts */
app.use('/', routes_1.default);
function startService() {
    return __awaiter(this, void 0, void 0, function* () {
        /** CONNECT DB */
        yield (0, pgClient_1.connectPostgresDB)(); // connect db
        yield (0, pgClient_1.createDatabase)(); // create if not exists
        yield (0, pgTablesMigration_1.default)(); // create tables if not exists
        app.listen(config_1.default.service.port, () => {
            (0, logger_1.default)({ log: 'SERVER STARTED LISTING', port: config_1.default.service.port });
        });
    });
}
/** START ASYNC */
startService().catch(console.error);
//# sourceMappingURL=index.js.map