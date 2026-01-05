import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand,
  type PutCommandInput,
  type GetCommandInput,
  type QueryCommandInput,
  type DeleteCommandInput,
  type UpdateCommandInput,
  type PutCommandOutput,
  type GetCommandOutput,
  type QueryCommandOutput,
  type DeleteCommandOutput,
  type UpdateCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { getOrThrowEnvironmentVariable } from "./throwUtils";
import { Config, findSiteByContext, findSiteByDomain, findSiteByUserId, type ReqContext } from "./getSite";

// Lazy initialization to avoid requiring AWS credentials when using JSON storage
let _dynamoDb: DynamoDBDocumentClient | null = null;

function getDynamoDBClient(): DynamoDBDocumentClient {
  if (!_dynamoDb) {
    // Environment variables
    const REGION = getOrThrowEnvironmentVariable("AWS_REGION");
    const ACCESS_KEY_ID = getOrThrowEnvironmentVariable("AWS_ACCESS_KEY_ID");
    const SECRET_ACCESS_KEY = getOrThrowEnvironmentVariable("AWS_SECRET_ACCESS_KEY");

    // DynamoDB Client Configuration
    const clientConfig = {
      region: REGION,
      credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
      },
    } as const;

    const documentClientConfig = {
      marshallOptions: {
        removeUndefinedValues: true,
        convertEmptyValues: true,
      },
    } as const;

    // Client Initialization
    const client = new DynamoDBClient(clientConfig);
    _dynamoDb = DynamoDBDocumentClient.from(client, documentClientConfig);
  }
  return _dynamoDb;
}

// Export dynamoDb as a getter property using Proxy for lazy initialization
export const dynamoDb = new Proxy({} as DynamoDBDocumentClient, {
  get(target, prop) {
    const client = getDynamoDBClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});

// Table Names
const SITE_CONFIG_TABLE = "lbsa71_net";

// Command Types
export type {
  PutCommandInput,
  GetCommandInput,
  QueryCommandInput,
  DeleteCommandInput,
  UpdateCommandInput,
  PutCommandOutput,
  GetCommandOutput,
  QueryCommandOutput,
  DeleteCommandOutput,
  UpdateCommandOutput,
};

// Commands
export {
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand,
};

// Site Configuration Operations
export const getConfig = async (): Promise<Config> => {
  const { getRepository } = await import('./storage/repositoryFactory');
  const repository = getRepository();
  return await repository.getConfig();
};

// Site Fetch Operations
export const fetchSiteByContext = async (context: ReqContext) => {
  const config = await getConfig();
  return findSiteByContext(config, context);
};

export const fetchSiteByDomain = async (domain: string) => {
  const config = await getConfig();
  return findSiteByDomain(config, domain);
};

export const fetchSiteByUserId = async (user_id: string) => {
  const config = await getConfig();
  return findSiteByUserId(config, user_id);
}; 