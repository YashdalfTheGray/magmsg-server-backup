import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';

export interface DynamoDbClientConfig {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  region: string;
}

const getCreds = async (
  accessKeyId: string,
  secretAccessKey: string,
  externalId: string,
  roleArn: string,
  region = 'us-east-2'
) => {
  try {
    const stsClient = new STSClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const role = await stsClient.send(
      new AssumeRoleCommand({
        RoleArn: roleArn,
        RoleSessionName: `messages-session-${Date.now()}`,
        ExternalId: externalId,
      })
    );

    return {
      accessKeyId: role.Credentials?.AccessKeyId,
      secretAccessKey: role.Credentials?.SecretAccessKey,
      sessionToken: role.Credentials?.SessionToken,
      expiration: role.Credentials?.Expiration,
    };
  } catch (e) {
    throw e;
  }
};

const getDynamoDbClient = ({ region, ...creds }: DynamoDbClientConfig) => {
  try {
    return new DynamoDBClient({
      region,
      credentials: creds,
    });
  } catch (e) {
    throw e;
  }
};

export { getCreds, getDynamoDbClient };
