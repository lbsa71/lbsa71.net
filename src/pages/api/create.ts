import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from "@/lib/dynamodb";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { ContentDocument } from "@/types/core";
import { ApiResponse, CreateDocumentRequest } from "@/types/api";
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

const createHandler = async (req: VercelRequest, res: VercelResponse) => {
  const { userId, documentId = new Date().toISOString(), content } = req.body as CreateDocumentRequest;

  if (!userId || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const now = new Date().toISOString();

  const putCommand = new PutCommand({
    TableName: "lbsa71_net",
    Item: {
      user_id: userId,
      document_id: documentId,
      content,
      createdAt: now,
      updatedAt: now,
    },
  });

  try {
    await dynamoDb.send(putCommand);

    // Convert to our new type system
    const dbDoc: DBDocument = {
      id: documentId,
      userId,
      content,
      createdAt: now,
      updatedAt: now,
    };

    const document = wrapDocument(dbDoc);
    res.status(200).json({ data: document });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create document" });
  }
};

export default createHandler;
