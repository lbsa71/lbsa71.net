// lib/dynamodbClient.ts
import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { getOrThrowEnvironmentVariable } from "./throwUtils";

// Assert environment variables are defined or provide default values
const REGION = getOrThrowEnvironmentVariable("AWS_REGION");
const ACCESS_KEY_ID = getOrThrowEnvironmentVariable("AWS_ACCESS_KEY_ID");
const SECRET_ACCESS_KEY = getOrThrowEnvironmentVariable(
  "AWS_SECRET_ACCESS_KEY"
);

const clientConfig: DynamoDBClientConfig = {
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
} as const;

export const dynamoDBClient = new DynamoDBClient(clientConfig);
