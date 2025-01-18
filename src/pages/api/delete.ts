// api/delete.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDBClient } from "./lib/dynamodbClient";

const deleteHandler = async (req: VercelRequest, res: VercelResponse) => {
  const { user_id, document_id } = req.body;

  try {
    await dynamoDBClient.send(
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

export default deleteHandler;
