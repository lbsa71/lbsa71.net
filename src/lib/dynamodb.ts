import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
  DynamoDBDocumentClient,
  PutCommand, 
  GetCommand, 
  QueryCommand,
  DeleteCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";
import { getOrThrowEnvironmentVariable } from "./throwUtils";

const REGION = getOrThrowEnvironmentVariable("AWS_REGION");
const ACCESS_KEY_ID = getOrThrowEnvironmentVariable("AWS_ACCESS_KEY_ID");
const SECRET_ACCESS_KEY = getOrThrowEnvironmentVariable("AWS_SECRET_ACCESS_KEY");

const clientConfig = {
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
};

const client = new DynamoDBClient(clientConfig);

const documentClientConfig = {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: true,
  },
} as const;

export const dynamoDb = DynamoDBDocumentClient.from(client, documentClientConfig);

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
} from "@aws-sdk/lib-dynamodb";

export {
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand,
}; 