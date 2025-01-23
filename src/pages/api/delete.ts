// api/delete.ts
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from "@/lib/dynamodb";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { ApiResponse, DeleteDocumentRequest } from "@/types/api";

const deleteHandler = async (req: VercelRequest, res: VercelResponse) => {
  const { userId, documentId } = req.body as DeleteDocumentRequest;

  if (!userId || !documentId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const deleteCommand = new DeleteCommand({
    TableName: "lbsa71_net",
    Key: {
      user_id: userId,
      document_id: documentId,
    },
  });

  try {
    await dynamoDb.send(deleteCommand);
    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete document" });
  }
};

export default deleteHandler;
