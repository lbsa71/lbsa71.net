import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb, DBDocument } from "@/lib/dynamodb";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { ContentDocument } from "@/types/core";
import { localDocuments } from "./localDocuments";
import { wrapDocument } from "@/lib/wrapDocument";

export const listDocuments = async (user_id: string): Promise<ContentDocument[]> => {
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
  if (!data.Items) return [];

  // Convert from DynamoDB format to our new type system
  return data.Items.map(item => {
    const dbDoc: DBDocument = {
      document_id: item.document_id,
      user_id: item.user_id,
      content: item.content,
      title: item.title,
      hero_img: item.hero_img,
      media_item: item.media_item,
      playlist: item.playlist,
      ordinal: item.ordinal,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
    return wrapDocument(dbDoc);
  });
};

const handler = async (req: VercelRequest, res: VercelResponse) => {
  const { user_id } = req.query;

  if (typeof user_id !== "string") {
    return res.status(400).json({ error: "Invalid query parameters" });
  }

  try {
    const documents = await listDocuments(user_id);
    res.status(200).json({ data: documents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to query documents" });
  }
};

export default handler;
