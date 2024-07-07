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
const logger_1 = __importDefault(require("../helper/logger"));
const Contact_1 = __importDefault(require("../models/Contact"));
const identify = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const email = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.email;
    const phoneNumber = ((_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.phoneNumber) && ((_c = req === null || req === void 0 ? void 0 : req.body) === null || _c === void 0 ? void 0 : _c.phoneNumber).toString();
    if (!email && !phoneNumber) {
        const resObj = {
            success: false,
            message: "EMAIL_OR_PHONENUMBER_IS_MADNATORY",
            request: req.body,
            contact: {}
        };
        (0, logger_1.default)(Object.assign({ type: 'error', log: resObj.message }, resObj));
        return res.status(400).send(resObj);
    }
    try {
        /** STEPS TO FOLLOW
         *
         * 1. get all the rows that contains eighter email or phoneNumber order by createdAt
         *
         * 2. if not found then insert this entry as primary
         *
         * 3. if one primary found,
         *    3.1. if input has both, but db has any one, update document
         *    3.2. if input has both && db has both
         *    3.3. if email is newOne -> insert as secondary in DB
         *    3.4. if phoneNumber is newOne -> insert as secondary in DB
         *
         * 4. if multiple entries found
         *    4.1. collect all emails
         *    4.2. collect all phoneNumbers
         *    4.3. collect multiple primaries
         *
         *    4.4. if multiple primary found then make one primary and rest all seconday
         *    4.5. if current email not fount in all_emails, create one
         *    4.5. if current phoneNumber not fount in all_phoneNumbers, create one
         *    4.6. get all secondaryIds and prepare for result
         *
         * 5. return success result
         */
        /** STEP - 1 */
        const allContactsResult = yield Contact_1.default.getAllContacts(email, phoneNumber);
        let primaryContatctId = 0;
        let emailList = new Set();
        let phoneNumberList = new Set();
        let secondaryContactIdsList = new Set();
        if (!allContactsResult || !allContactsResult.rowCount || allContactsResult.rowCount <= 0) {
            /** STEP - 2 */
            const insertResult = yield Contact_1.default.insertOne(email || null, phoneNumber || null, null, 'primary');
            if (!insertResult.rows || !insertResult.rows[0]) {
                throw new Error('FAILED_TO_IDENTIFY_CONTECT');
            }
            primaryContatctId = insertResult.rows[0].id;
            email && emailList.add(email);
            phoneNumber && phoneNumberList.add(phoneNumber);
        }
        else if (allContactsResult.rowCount === 1) {
            /** STEP - 3 */
            let existingSingleData = allContactsResult.rows[0];
            primaryContatctId = existingSingleData.id;
            let insertSecondary = false;
            if (email
                && phoneNumber
                && ((!existingSingleData.email)
                    || (!existingSingleData.phonenumber)
                    || (existingSingleData.email !== email)
                    || (existingSingleData.phonenumber !== phoneNumber))) {
                insertSecondary = true;
            }
            existingSingleData.email && emailList.add((existingSingleData.email).toString());
            existingSingleData.phonenumber && phoneNumberList.add((existingSingleData.phonenumber).toString());
            if (insertSecondary && email && phoneNumber) {
                const result = yield Contact_1.default.insertOne(email, phoneNumber, existingSingleData.id, 'secondary');
                if (result && result.rowCount && result.rowCount > 0) {
                    email && emailList.add((email).toString());
                    phoneNumber && phoneNumberList.add(phoneNumber);
                    result.rows[0] && secondaryContactIdsList.add(result.rows[0].id);
                }
            }
        }
        else {
            /** STEP - 4 */
            let existingMultiData = allContactsResult.rows;
            let updateAsSecondaryIds = [];
            for (let index = 0; index < existingMultiData.length; index++) {
                const { id: tId, email: tEmail, phonenumber: tPhoneNumber, linkprecedence: tLinkPrecedence } = existingMultiData[index];
                tEmail && emailList.add(tEmail);
                tPhoneNumber && phoneNumberList.add(tPhoneNumber);
                if (tLinkPrecedence && tLinkPrecedence === "primary") {
                    if (!primaryContatctId) {
                        primaryContatctId = tId;
                    }
                    else {
                        updateAsSecondaryIds.push(tId);
                    }
                }
                if (tId && primaryContatctId && tId !== primaryContatctId) {
                    secondaryContactIdsList.add(tId);
                }
            }
            if (!primaryContatctId) { // all are secondary, need to make 1st one primary && rest all are secondary
                (0, logger_1.default)({ type: 'error', log: 'ALL_ARE_SECONDARY SOMETHING_WENT_WRONG', existingMultiData });
                for (let index = 0; index < existingMultiData.length; index++) {
                    const { id } = existingMultiData[index];
                    if (!primaryContatctId) {
                        primaryContatctId = id;
                    }
                    else {
                        updateAsSecondaryIds.push(id);
                    }
                }
                if (primaryContatctId) {
                    // update as primary
                    yield Contact_1.default.updateOne(primaryContatctId, ["linkedId", "linkPrecedence"], [null, "primary"]);
                }
            }
            // update as secondary for this primaryContatctId
            if (updateAsSecondaryIds.length > 0) {
                yield Contact_1.default.updateMany(updateAsSecondaryIds, ["linkedId", "linkPrecedence"], [primaryContatctId, "secondary"]);
            }
            // insert as secondary
            if (primaryContatctId && email && phoneNumber && (!emailList.has(email) || !phoneNumberList.has(phoneNumber))) {
                const result = yield Contact_1.default.insertOne(email || null, phoneNumber || null, primaryContatctId, 'secondary');
                if (result && result.rows && result.rows[0]) {
                    emailList.add(email);
                    phoneNumberList.add(phoneNumber);
                    secondaryContactIdsList.add(result.rows[0].id);
                }
            }
        }
        /** STEP - 5 */
        const resObj = {
            success: true,
            message: "SUCCESS",
            request: req.body,
            contact: {
                primaryContatctId: primaryContatctId,
                emails: Array.from(emailList),
                phoneNumbers: Array.from(phoneNumberList),
                secondaryContactIds: Array.from(secondaryContactIdsList)
            }
        };
        return res.status(200).send(resObj);
    }
    catch (error) {
        const resObj = {
            success: false,
            message: "INTERNAL_OPERATION_ERROR",
            request: req.body,
            error: error.message,
            contact: {}
        };
        (0, logger_1.default)(Object.assign(Object.assign({ type: 'error', log: resObj.message }, resObj), { error: error }));
        return res.status(500).send(resObj);
    }
});
exports.default = {
    identify
};
//# sourceMappingURL=contactController.js.map