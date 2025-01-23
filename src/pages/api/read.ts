import { GetCommand } from "@aws-sdk/lib-dynamodb";
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

export const getDocument = async (userId: string, documentId: string): Promise<ContentDocument> => {
  if (userId === "local") {
    const document = localDocuments.find(doc => doc.id === documentId);
    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }
    return document;
  }

  const getCommand = new GetCommand({
    TableName: "lbsa71_net",
    Key: {
      user_id: userId,
      document_id: documentId,
    },
  });

  const data = await dynamoDb.send(getCommand);
  if (!data.Item) {
    throw new Error(`Document not found: ${documentId}`);
  }

  // Convert from DynamoDB format to our new type system
  const dbDoc: DBDocument = {
    id: data.Item.document_id,
    userId: data.Item.user_id,
    content: data.Item.content,
    title: data.Item.title,
    heroImage: data.Item.hero_img,
    mediaItem: data.Item.media_item,
    playlist: data.Item.playlist,
    ordinal: data.Item.ordinal,
    createdAt: data.Item.createdAt,
    updatedAt: data.Item.updatedAt,
  };

  return wrapDocument(dbDoc);
};

const handler = async (req: VercelRequest, res: VercelResponse) => {
  const { user_id: userId, document_id: documentId } = req.query;

  if (typeof userId !== "string" || typeof documentId !== "string") {
    return res.status(400).json({ error: "Invalid query parameters" });
  }

  try {
    const document = await getDocument(userId, documentId);
    res.status(200).json({ data: document });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get document" });
  }
};

export default handler;
