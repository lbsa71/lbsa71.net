import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GetCommand, dynamoDb } from "@/lib/dynamodb";
import { ContentDocument } from "@/lib/getSite";
import { localDocument } from "./localDocuments";

export const getDocument = async (user_id: string, document_id: string) => {
  if (document_id === "local") {
    return localDocument;
  }

  return (
    await dynamoDb.send(
      new GetCommand({
        TableName: "lbsa71_net",
        Key: {
          user_id,
          document_id,
        },
      })
    )
  ).Item as ContentDocument | undefined;
};

const handler = async (req: VercelRequest, res: VercelResponse) => {
  const { user_id, document_id } = req.query;

  if (typeof user_id !== "string" || typeof document_id !== "string") {
    return res.status(400).json({ error: "Invalid query" });
  }

  try {
    const document = await getDocument(user_id, document_id);

    if (document) {
      res.status(200).json(document);
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to read post" });
  }
};

export default handler;
