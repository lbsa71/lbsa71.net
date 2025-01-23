import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb, DBDocument } from "@/lib/dynamodb";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { ContentDocument } from "@/types/core";
import { ApiResponse } from "@/types/api";
import { localDocuments } from "./localDocuments";
import { wrapDocument } from "@/lib/wrapDocument";

export const getDocument = async (user_id: string, documentId: string): Promise<ContentDocument> => {
  if (user_id === "local") {
    const document = localDocuments.find(doc => doc.document_id === documentId);
    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }
    return document;
  }

  const getCommand = new GetCommand({
    TableName: "lbsa71_net",
    Key: {
      user_id: user_id,
      document_id: documentId,
    },
  });

  const data = await dynamoDb.send(getCommand);
  if (!data.Item) {
    throw new Error(`Document not found: ${documentId}`);
  }

  return wrapDocument(( data.Item) as DBDocument );
};

const handler = async (req: VercelRequest, res: VercelResponse) => {
  const { user_id: user_id, document_id: documentId } = req.query;

  if (typeof user_id !== "string" || typeof documentId !== "string") {
    return res.status(400).json({ error: "Invalid query parameters" });
  }

  try {
    const document = await getDocument(user_id, documentId);
    res.status(200).json({ data: document });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get document" });
  }
};

export default handler;
