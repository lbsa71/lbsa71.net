import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb, DBDocument } from "@/lib/dynamodb";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { ContentDocument } from "@/types/core";
import { ApiResponse, CreateDocumentRequest } from "@/types/api";
import { wrapDocument } from "@/lib/wrapDocument";

const createHandler = async (req: VercelRequest, res: VercelResponse) => {
  const { user_id, documentId: document_id = new Date().toISOString(), content } = req.body as CreateDocumentRequest;

  if (!user_id || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const now = new Date().toISOString();

  const putCommand = new PutCommand({
    TableName: "lbsa71_net",
    Item: {
      user_id: user_id,
      document_id: document_id,
      content,
      createdAt: now,
      updatedAt: now,
    },
  });

  try {
    await dynamoDb.send(putCommand);

    const dbDoc: DBDocument = {
      document_id,
      user_id,
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
