import type { VercelRequest, VercelResponse } from "@vercel/node";
import { DeleteCommand, dynamoDb } from "@/lib/dynamodb";
import { withAuth } from "./lib/withAuth";

const deleteHandler = async (req: VercelRequest, res: VercelResponse) => {
  const { user_id, document_id } = req.body;

  if (!user_id || !document_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
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
