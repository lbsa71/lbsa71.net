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


export type DBDocument = {
  document_id: string;
  user_id: string;
  content: string;
  title?: string;
  heroImage?: string;
  mediaItem?: string;
  playlist?: string;
  ordinal?: string;
  createdAt?: string;
  updatedAt?: string;
};

// Environment variables
const REGION = process.env.AWS_REGION;
const ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

if (!REGION || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
  throw new Error("Missing AWS credentials");
}

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
export const dynamoDb = DynamoDBDocumentClient.from(client, documentClientConfig);

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
  const queryCommand = new QueryCommand({
    TableName: SITE_CONFIG_TABLE,
    KeyConditionExpression: "user_id = :uid and document_id = :did",
    ExpressionAttributeValues: {
      ":uid": "_root",
      ":did": "config",
    },
  });

  const data = await dynamoDb.send(queryCommand);

  if (!data.Items?.[0]) {
    throw new Error("Site configuration not found");
  }

  return data.Items[0] as Config;
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