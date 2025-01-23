import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from "@/lib/dynamodb";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { ContentDocument } from "@/types/core";
import { ApiResponse } from "@/types/api";
import { localDocuments } from "./localDocuments";
import { wrapDocument } from "@/lib/wrapDocument";

type DBDocument = {
  id: string;
  userId: string;
  content: string;
  title?: string;
  heroImage?: string;
  mediaItem?: string;
  playlist?: string;
  ordinal?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const listDocuments = async (userId: string): Promise<ContentDocument[]> => {
  if (userId === "local") {
    return localDocuments;
  }

  const queryCommand = new QueryCommand({
    TableName: "lbsa71_net",
    KeyConditionExpression: "user_id = :uid",
    ExpressionAttributeValues: {
      ":uid": userId,
    },
  });

  const data = await dynamoDb.send(queryCommand);
  if (!data.Items) return [];

  // Convert from DynamoDB format to our new type system
  return data.Items.map(item => {
    const dbDoc: DBDocument = {
      id: item.document_id,
      userId: item.user_id,
      content: item.content,
      title: item.title,
      heroImage: item.hero_img,
      mediaItem: item.media_item,
      playlist: item.playlist,
      ordinal: item.ordinal,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
    return wrapDocument(dbDoc);
  });
};

const handler = async (req: VercelRequest, res: VercelResponse) => {
  const { user_id: userId } = req.query;

  if (typeof userId !== "string") {
    return res.status(400).json({ error: "Invalid query parameters" });
  }

  try {
    const documents = await listDocuments(userId);
    res.status(200).json({ data: documents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to query documents" });
  }
};

export default handler;
