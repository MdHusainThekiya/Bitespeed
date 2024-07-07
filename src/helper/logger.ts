import moment from 'moment';
import path from 'path';
import config from '../config';

interface AllowedLogLevels {
  'error' : boolean,
  'warn'  : boolean,
  'info'  : boolean,
  'debug' : boolean,
  'trace' : boolean
}

interface LoggingData {
  type         ?: keyof AllowedLogLevels,
  fileName     ?: string,
  functionName ?: string,
  log          ?: string,
  loggingData  ?: any,
  [key: string] : any
}

const allowedLogLevels : AllowedLogLevels = {
  'error' : config.service.allowedLogLevels.indexOf('error') !== -1 || config.service.allowedLogLevels.indexOf('all') !== -1 ? true : false,
  'warn'  : config.service.allowedLogLevels.indexOf('warn')  !== -1 || config.service.allowedLogLevels.indexOf('all') !== -1 ? true : false,
  'info'  : config.service.allowedLogLevels.indexOf('info')  !== -1 || config.service.allowedLogLevels.indexOf('all') !== -1 ? true : false,
  'debug' : config.service.allowedLogLevels.indexOf('debug') !== -1 || config.service.allowedLogLevels.indexOf('all') !== -1 ? true : false,
  'trace' : config.service.allowedLogLevels.indexOf('trace') !== -1 || config.service.allowedLogLevels.indexOf('all') !== -1 ? true : false,
};

function getFileNameAndFunctionName() {
  const error = new Error();
  const stack = error.stack && error.stack.split('\n');
  const result = { functionName: 'none', fileName: 'none' };
  if (stack && stack.length >= 4) { // Adjusted to ensure correct line index
    const callerLine = stack[3].trim().split(' (');
    result.functionName = callerLine && callerLine.length > 1 && callerLine[0] && callerLine[0].split(' ')?.pop() || 'none';
    result.fileName = callerLine && callerLine[1] && callerLine[1].split(':')[0] || 'none';
  }
  return result;
}

function logger (loggingData : LoggingData) {

  /*
    type         ----> 'fatal', 'error', 'warn', 'info', 'debug', 'trace' or 'silent'
    fileName     ---->  default 'none'
    functionName ---->  default 'none'
    log          ---->  "logging comment"
    loggingData  ---->  dynamic logging data
  */

  if (!config.service.enableLogs) {
    return;
  }

  loggingData.type = loggingData.type ? loggingData.type : 'info';

  if (allowedLogLevels && !allowedLogLevels[loggingData.type]) {
    return;
  }

  let { type = 'info', log = 'LOG', functionName, fileName } = loggingData;

  if ((!functionName || !fileName) && config.service.enableLogLocation) {
    let tNames = getFileNameAndFunctionName();
    functionName = functionName || tNames.functionName;
    fileName     = fileName || tNames.fileName;
  }

  fileName = fileName ? path.basename(fileName) : 'none';
  functionName = functionName || 'none';

  delete loggingData['type'];
  delete loggingData['fileName'];
  delete loggingData['functionName'];
  delete loggingData['log'];

  if (console[type] && typeof (console[type]) == 'function') {
    console[type]({
      log,
      fileName,
      functionName,
      timestamp: moment().format("YYYY-MM-DD HH:mm:ss SSS"),
      ...loggingData,
    })
  } else {
    console.info({
      log,
      fileName,
      functionName,
      timestamp: moment().format("YYYY-MM-DD HH:mm:ss SSS"),
      ...loggingData,
    })
  }

}

export default logger;