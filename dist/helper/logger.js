"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../config"));
const allowedLogLevels = {
    'error': config_1.default.service.allowedLogLevels.indexOf('error') !== -1 || config_1.default.service.allowedLogLevels.indexOf('all') !== -1 ? true : false,
    'warn': config_1.default.service.allowedLogLevels.indexOf('warn') !== -1 || config_1.default.service.allowedLogLevels.indexOf('all') !== -1 ? true : false,
    'info': config_1.default.service.allowedLogLevels.indexOf('info') !== -1 || config_1.default.service.allowedLogLevels.indexOf('all') !== -1 ? true : false,
    'debug': config_1.default.service.allowedLogLevels.indexOf('debug') !== -1 || config_1.default.service.allowedLogLevels.indexOf('all') !== -1 ? true : false,
    'trace': config_1.default.service.allowedLogLevels.indexOf('trace') !== -1 || config_1.default.service.allowedLogLevels.indexOf('all') !== -1 ? true : false,
};
function getFileNameAndFunctionName() {
    var _a;
    const error = new Error();
    const stack = error.stack && error.stack.split('\n');
    const result = { functionName: 'none', fileName: 'none' };
    if (stack && stack.length >= 4) { // Adjusted to ensure correct line index
        const callerLine = stack[3].trim().split(' (');
        result.functionName = callerLine && callerLine.length > 1 && callerLine[0] && ((_a = callerLine[0].split(' ')) === null || _a === void 0 ? void 0 : _a.pop()) || 'none';
        result.fileName = callerLine && callerLine[1] && callerLine[1].split(':')[0] || 'none';
    }
    return result;
}
function logger(loggingData) {
    /*
      type         ----> 'fatal', 'error', 'warn', 'info', 'debug', 'trace' or 'silent'
      fileName     ---->  default 'none'
      functionName ---->  default 'none'
      log          ---->  "logging comment"
      loggingData  ---->  dynamic logging data
    */
    if (!config_1.default.service.enableLogs) {
        return;
    }
    loggingData.type = loggingData.type ? loggingData.type : 'info';
    if (allowedLogLevels && !allowedLogLevels[loggingData.type]) {
        return;
    }
    let { type = 'info', log = 'LOG', functionName, fileName } = loggingData;
    if ((!functionName || !fileName) && config_1.default.service.enableLogLocation) {
        let tNames = getFileNameAndFunctionName();
        functionName = functionName || tNames.functionName;
        fileName = fileName || tNames.fileName;
    }
    fileName = fileName ? path_1.default.basename(fileName) : 'none';
    functionName = functionName || 'none';
    delete loggingData['type'];
    delete loggingData['fileName'];
    delete loggingData['functionName'];
    delete loggingData['log'];
    if (console[type] && typeof (console[type]) == 'function') {
        console[type](Object.assign({ log,
            fileName,
            functionName, timestamp: (0, moment_1.default)().format("YYYY-MM-DD HH:mm:ss SSS") }, loggingData));
    }
    else {
        console.info(Object.assign({ log,
            fileName,
            functionName, timestamp: (0, moment_1.default)().format("YYYY-MM-DD HH:mm:ss SSS") }, loggingData));
    }
}
exports.default = logger;
//# sourceMappingURL=logger.js.map