import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from "@/lib/dynamodb";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { ContentDocument } from "@/lib/getSite";
import { localDocuments } from "./localDocuments";

export const listDocuments = async (user_id: string) => {
  if (user_id === "local") {
    return localDocuments;
  }

  const queryCommand = new QueryCommand({
    TableName: "lbsa71_net",
    KeyConditionExpression: "user_id = :uid",
    ExpressionAttributeValues: {
      ":uid": user_id,
    },
  });

  const data = await dynamoDb.send(queryCommand);
  return data.Items as ContentDocument[] | undefined;
};

const handler = async (req: VercelRequest, res: VercelResponse) => {
  const { user_id } = req.query;

  if (typeof user_id !== "string") {
    return res.status(400).json({ error: "Invalid query" });
  }

  try {
    const items = await listDocuments(user_id);

    if (items) {
      res.status(200).json(items);
    } else {
      res.status(404).json({ message: "No documents found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to query documents" });
  }
};

export default handler;
