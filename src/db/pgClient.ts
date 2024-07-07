import pg from 'pg'
import config from '../config';
import logger from '../helper/logger';

export let pool : pg.Pool;

export const connectPostgresDB = async () => {
  pool = new pg.Pool({
    host : config.db.host,
    port : config.db.port,
    user : config.db.user,
    password : config.db.password,
    database : config.db.database,
  });
  await pool.connect();
  logger({ log : 'PG_CLIENT_CONNECTED_SUCCESSFULLY' });
}

export const createDatabase = async () => {

  const result = await pool.query('SELECT datname FROM pg_catalog.pg_database WHERE datname = $1', [config.db.database])

  if (!result || result.rowCount !== 1) {
    await pool.query('CREATE DATABASE $1', [config.db.database]);
  }
  logger({ log : 'DATABASE_IS_READY', database : config.db.database });
}

export default pg;