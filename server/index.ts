import { resolve } from 'path';

import * as dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import chalk from 'chalk';

import { checkAuthToken } from './auth';
import { wrap } from './utils';
import {
  getAllMessagesHandler,
  getMessageHandler,
  putMessageHandler,
} from './middlewares';
import { getCredsFromEnvironment, getDynamoDbClient } from './sdk';

(async () => {
  dotenv.config();

  const { PORT, USER_ACCESS_TOKEN, AWS_DYNAMO_DB_TABLE_NAME } = process.env;

  const port = PORT || process.argv[2] || 8080;
  const app = express();
  const apiRouter = express.Router();

  app.use(bodyParser.json());
  app.use(morgan('common'));
  app.use(express.static(resolve('public')));

  const creds = await getCredsFromEnvironment();
  app.locals.client = getDynamoDbClient(
    creds.accessKeyId || '',
    creds.secretAccessKey || '',
    creds.sessionToken || ''
  );
  app.locals.expiration = creds.expiration || new Date();

  apiRouter.get('/', (_, res) => {
    res.json({
      status: 'okay',
    });
  });
  apiRouter.get(
    '/messages/:messageId',
    checkAuthToken(USER_ACCESS_TOKEN || ''),
    wrap(getMessageHandler(AWS_DYNAMO_DB_TABLE_NAME || 'messages'))
  );
  apiRouter.get(
    '/messages',
    checkAuthToken(USER_ACCESS_TOKEN || ''),
    wrap(getAllMessagesHandler(AWS_DYNAMO_DB_TABLE_NAME || 'messages'))
  );
  apiRouter.put(
    '/messages',
    checkAuthToken(USER_ACCESS_TOKEN || ''),
    wrap(putMessageHandler(AWS_DYNAMO_DB_TABLE_NAME || 'messages'))
  );

  app.use('/api', apiRouter);

  app.listen(port, () =>
    // tslint:disable-next-line
    console.log(`Server running on port ${chalk.green(port)}`)
  );
})();
