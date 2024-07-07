import express, { Request, Response } from 'express';
import config from './config';
import logger from './helper/logger';
import { connectPostgresDB, createDatabase } from './db/pgClient';
import pgTablesMigration from './db/pgTablesMigration';
import routes from './routes/routes';

const app = express();

app.use(express.json());

app.get('/', (req : Request, res : Response) => { res.send("<b>Hello World!</b>") });

/** ROUTES ARE DEFINED IN ./routes/routes.ts */
app.use('/', routes);

async function startService() {
  
  /** CONNECT DB */
  await connectPostgresDB(); // connect db
  await createDatabase(); // create if not exists
  await pgTablesMigration(); // create tables if not exists

  app.listen(config.service.port, () => {
    logger({log: 'SERVER STARTED LISTING', port : config.service.port })
  })

}

/** START ASYNC */
startService().catch(console.error);