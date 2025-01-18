// lib/dynamodbClient.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { getOrThrowEnvironmentVariable } from "../../../lib/throwUtils";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { Config, findSiteByContext, findSiteByDomain, findSiteByUserId, ReqContext } from "@/lib/getSite";

// Assert environment variables are defined or provide default values
const REGION = getOrThrowEnvironmentVariable("AWS_REGION");
const ACCESS_KEY_ID = getOrThrowEnvironmentVariable("AWS_ACCESS_KEY_ID");
const SECRET_ACCESS_KEY = getOrThrowEnvironmentVariable(
  "AWS_SECRET_ACCESS_KEY"
);

export const dynamoDBClient = new DynamoDBClient({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

export const getConfig = async () => {
  const queryCommand = new QueryCommand({
    TableName: "lbsa71_net",
    KeyConditionExpression: "user_id = :uid and document_id = :did",
    ExpressionAttributeValues: {
      ":uid": "_root",
      ":did": "config",
    },
  });

  const data = await dynamoDBClient.send(queryCommand);

  if (!data.Items || data.Items.length !== 1) {
    throw new Error("No Config");
  }


  return data.Items[0] as Config;
};


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