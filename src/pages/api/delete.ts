import type { VercelRequest, VercelResponse } from "@vercel/node";
import { DeleteCommand, dynamoDb } from "@/lib/dynamodb";
import { withAuth } from "./lib/withAuth";
import { backupDocument, getDocumentForBackup } from "@/lib/backupDocument";

const deleteHandler = async (req: VercelRequest, res: VercelResponse) => {
  const { user_id, document_id } = req.body;

  if (!user_id || !document_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Get current document data for backup
    const documentData = await getDocumentForBackup(user_id, document_id);
    if (!documentData) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Create backup
    await backupDocument(documentData);

    // Delete the document
    await dynamoDb.send(
      new DeleteCommand({
        TableName: "lbsa71_net",
        Key: {
          user_id,
          document_id,
        },
      })
    );

    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete post" });
  }
};

export default withAuth(deleteHandler);
