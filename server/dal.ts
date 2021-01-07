import {
  AttributeValue,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
} from '@aws-sdk/client-dynamodb';
import * as uuid from 'uuid';

const getAllMessages = async (
  client: DynamoDBClient,
  tableName: string,
  fieldsToGetCsv?: string
) => {
  const command = new ScanCommand({
    TableName: tableName,
  });

  if (fieldsToGetCsv) {
    command.input.ProjectionExpression = fieldsToGetCsv;
  }
  const result = await client.send(command);

  if (result.Count && result.Count > 0) {
    return result.Items?.map((item) => parseDynamoDbItem(item));
  } else {
    return [];
  }
};

const getMessageById = async (
  client: DynamoDBClient,
  tableName: string,
  messageId: string,
  fieldsToGetCsv?: string
) => {
  const command = new GetItemCommand({
    TableName: tableName,
    Key: {
      messageId: {
        S: messageId,
      },
    },
  });

  if (fieldsToGetCsv) {
    command.input.ProjectionExpression = fieldsToGetCsv;
  }

  const result = await client.send(command);

  if (result.Item) {
    return parseDynamoDbItem(result.Item);
  }
};

const putMessage = async (
  client: DynamoDBClient,
  tableName: string,
  message: string,
  author: string
) =>
  client.send(
    new PutItemCommand({
      TableName: tableName,
      Item: {
        messageId: { S: uuid.v4() },
        createdAt: { N: Date.now().toString() },
        content: { S: message },
        createdBy: { S: author },
      },
    })
  );

const parseDynamoDbItem = (item: { [key: string]: AttributeValue }) =>
  Object.keys(item).reduce((acc, key) => {
    const value = item[key];
    if (value.S) {
      acc[key] = value.S;
    } else if (value.N) {
      acc[key] = parseInt(value.N, 10);
    }
    return acc;
  }, {});

export { getMessageById, getAllMessages, putMessage };
