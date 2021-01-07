import { Request, Response } from 'express';

import { getCredsFromEnvironment, getDynamoDbClient } from './sdk';
import { getMessageById, getAllMessages, putMessage } from './dal';

const getAllMessagesHandler = (TableName: string) => async (
  req: Request,
  res: Response
) => {
  if (req.app.locals.expiration.getTime() < Date.now()) {
    const newCreds = await getCredsFromEnvironment();
    req.app.locals.client = getDynamoDbClient(
      newCreds.accessKeyId || '',
      newCreds.secretAccessKey || '',
      newCreds.sessionToken || ''
    );
    req.app.locals.expiration = newCreds.expiration || new Date();
  }

  const items = await getAllMessages(req.app.locals.client, TableName);

  res.json(items);
};

const getMessageHandler = (tableName: string) => async (
  req: Request,
  res: Response
) => {
  if (req.app.locals.expiration.getTime() < Date.now()) {
    const newCreds = await getCredsFromEnvironment();
    req.app.locals.client = getDynamoDbClient(
      newCreds.accessKeyId || '',
      newCreds.secretAccessKey || '',
      newCreds.sessionToken || ''
    );
    req.app.locals.expiration = newCreds.expiration || new Date();
  }

  const item = await getMessageById(
    req.app.locals.client,
    tableName,
    req.params.messageId
  );

  res.json(item);
};

const putMessageHandler = (tableName: string) => async (
  req: Request,
  res: Response
) => {
  if (req.app.locals.expiration.getTime() < Date.now()) {
    const newCreds = await getCredsFromEnvironment();
    req.app.locals.client = getDynamoDbClient(
      newCreds.accessKeyId || '',
      newCreds.secretAccessKey || '',
      newCreds.sessionToken || ''
    );
    req.app.locals.expiration = newCreds.expiration || new Date();
  }

  await putMessage(
    req.app.locals.client,
    tableName,
    req.body.message,
    req.body.author
  );

  res.sendStatus(201);
};

export { getAllMessagesHandler, getMessageHandler, putMessageHandler };
