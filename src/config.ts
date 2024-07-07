import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path : path.join(__dirname, '../.env') })

interface ServiceConfig {
  port              : number,
  enableLogs        : boolean,
  allowedLogLevels  : Array<string>,
  enableLogLocation : boolean,
}
interface DBConfig {
  host     : string,
  port     : number,
  user     : string,
  password : string,
  database   : string,
}
interface Config {
  service : ServiceConfig,
  db : DBConfig,
}



const config : Config = {
  service : {
    port              : Number(process.env.PORT) || 4040,
    enableLogs        : process.env.ENABLE_LOGS ? (process.env.ENABLE_LOGS).trim().toString().toLowerCase() === "true" ? true : false                 : true,
    allowedLogLevels  : process.env.ALLOWED_LOG_LEVELS ? (process.env.ALLOWED_LOG_LEVELS).trim().toString().split(",")                                : ['all'],
    enableLogLocation : process.env.ENABLE_LOG_LOCATION ? (process.env.ENABLE_LOG_LOCATION).trim().toString().toLowerCase() === "true" ? true : false : false
  },
  db : {
    host     : (process.env.POSTGRES_HOST)?.trim().toString()     || "0.0.0.0",
    port     : Number(process.env.POSTGRES_PORT)                  || 5432,
    user     : (process.env.POSTGRES_USER)?.trim().toString()     || "defaultUser",
    password : (process.env.POSTGRES_PASSWORD)?.trim().toString() || "defaultPassword",
    database : (process.env.POSTGRES_DB_NAME)?.trim().toString()  || "defaultDB"
  }
}

export default config;