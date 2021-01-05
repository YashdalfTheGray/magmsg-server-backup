import {
  AttributeValue,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';
import * as uuid from 'uuid';

const getMessageById = async (
  client: DynamoDBClient,
  tableName: string,
  messageId: string
) => {
  const result = await client.send(
    new GetItemCommand({
      TableName: tableName,
      Key: {
        messageId: {
          S: messageId,
        },
      },
    })
  );

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

export { getMessageById, putMessage };
