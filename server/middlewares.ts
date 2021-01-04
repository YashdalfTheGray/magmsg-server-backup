import { Request, Response } from 'express';
import { GetItemCommand } from '@aws-sdk/client-dynamodb';

import { getCredsFromEnvironment, getDynamoDbClient } from './sdk';

const getMessage = (tableName: string) => async (
  req: Request,
  res: Response
) => {
  if (req.app.locals.expiration.getTime() < Date.now()) {
    const newCreds = await getCredsFromEnvironment();
    req.app.locals.dynamoDbClient = getDynamoDbClient(
      newCreds.accessKeyId || '',
      newCreds.secretAccessKey || '',
      newCreds.sessionToken || ''
    );
    req.app.locals.expiration = newCreds.expiration || new Date();
  }
};

const putMessage = (tableName: string) => (req: Request, res: Response) => {};

export { getMessage, putMessage };
