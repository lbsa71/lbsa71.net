import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { 
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

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export const dynamoDb = DynamoDBDocumentClient.from(client);

export {
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand,
}; 