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
const pgClient_1 = require("../db/pgClient");
const util_1 = __importDefault(require("../helper/util"));
const createTable = () => __awaiter(void 0, void 0, void 0, function* () {
    // Create a table if it does not exist
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS Contact (
      id SERIAL PRIMARY KEY,
      phoneNumber VARCHAR(20),
      email VARCHAR(100),
      linkedId INT,
      linkPrecedence VARCHAR(10) CHECK (linkPrecedence IN ('primary', 'secondary')),
      createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      deletedAt TIMESTAMP WITH TIME ZONE
    )
  `;
    yield pgClient_1.pool.query(createTableQuery);
});
const getAllContacts = (email, phoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    let whereQuery = "";
    let orderQuery = " ORDER BY id asc";
    if (email) {
        whereQuery = ` WHERE email = '${email}'`;
    }
    if (phoneNumber) {
        whereQuery += (whereQuery !== "") ? ` OR phoneNumber = '${phoneNumber}'` : ` WHERE phoneNumber = '${phoneNumber}'`;
    }
    let idSubQuery = "SELECT id FROM Contact" + whereQuery;
    let linkedIdSubQuery = "SELECT linkedid FROM Contact" + whereQuery;
    let query = "SELECT * from Contact WHERE";
    query += " id IN (" + idSubQuery + ") or linkedid IN (" + idSubQuery + ") or id IN (" + linkedIdSubQuery + ") or linkedid IN (" + linkedIdSubQuery + ")";
    query += orderQuery;
    return yield pgClient_1.pool.query(query);
});
const insertOne = (email, phoneNumber, linkedId, linkPrecedence) => __awaiter(void 0, void 0, void 0, function* () {
    let query = 'INSERT INTO Contact (phoneNumber, email, linkedId, linkPrecedence, createdAt, updatedAt) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
    let currentStamp = util_1.default.getStandaredDateTime("");
    return yield pgClient_1.pool.query(query, [phoneNumber, email, linkedId, linkPrecedence, currentStamp, currentStamp]);
});
const updateOne = (id, keysArray, valuesArray) => __awaiter(void 0, void 0, void 0, function* () {
    keysArray.push('updatedAt');
    valuesArray.push(util_1.default.getStandaredDateTime(""));
    let dollerRef = '';
    for (let index = 0; index < keysArray.length; index++) {
        if (dollerRef === '') {
            dollerRef = `${keysArray[index]} = $${index + 1}`;
        }
        else {
            dollerRef += `, ${keysArray[index]} = $${index + 1}`;
        }
    }
    let query = 'UPDATE Contact SET ' + dollerRef + ' WHERE id = ' + id + ' RETURNING *';
    return yield pgClient_1.pool.query(query, valuesArray);
});
const updateMany = (id, keysArray, valuesArray) => __awaiter(void 0, void 0, void 0, function* () {
    keysArray.push('updatedAt');
    valuesArray.push(util_1.default.getStandaredDateTime(""));
    let dollerRef = '';
    for (let index = 0; index < keysArray.length; index++) {
        if (dollerRef === '') {
            dollerRef = `${keysArray[index]} = $${index + 1}`;
        }
        else {
            dollerRef += `, ${keysArray[index]} = $${index + 1}`;
        }
    }
    let query = 'UPDATE Contact SET ' + dollerRef + ' WHERE id IN (' + id.join(",") + ') RETURNING *';
    return yield pgClient_1.pool.query(query, valuesArray);
});
exports.default = {
    createTable,
    getAllContacts,
    insertOne,
    updateOne,
    updateMany
};
//# sourceMappingURL=Contact.js.map