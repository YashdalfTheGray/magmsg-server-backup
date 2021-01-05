import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';

const getCredsFromEnvironment = () =>
  getCreds(
    process.env.AWS_ACCESS_KEY_ID || '',
    process.env.AWS_SECRET_ACCESS_KEY || '',
    process.env.AWS_ASSUME_ROLE_ARN || '',
    process.env.EXTERNAL_ID || ''
  );

const getCreds = async (
  accessKeyId: string,
  secretAccessKey: string,
  roleArn: string,
  externalId: string,
  region = process.env.AWS_REGION || 'us-east-2'
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

const getDynamoDbClient = (
  accessKeyId: string,
  secretAccessKey: string,
  sessionToken: string,
  region: string = process.env.AWS_REGION || 'us-east-2'
) => {
  try {
    return new DynamoDBClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
        sessionToken,
      },
    });
  } catch (e) {
    throw e;
  }
};

export { getCreds, getCredsFromEnvironment, getDynamoDbClient };
