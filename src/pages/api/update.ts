import type { VercelRequest, VercelResponse } from "@vercel/node";
import { UpdateCommand, dynamoDb } from "@/lib/dynamodb";
import { withAuth } from "./lib/withAuth";
import { backupDocument } from "@/lib/backupDocument";

const updateHandler = async (req: VercelRequest, res: VercelResponse) => {
  const {
    user_id,
    document_id,
    content,
    hero_img,
    media_item,
    playlist,
    ordinal,
  } = req.body;

  if (!user_id || !document_id || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Create backup
    await backupDocument({
      user_id,
      document_id,
      content,
      hero_img,
      media_item,
      playlist,
      ordinal,
    });

    const result = await dynamoDb.send(
      new UpdateCommand({
        TableName: "lbsa71_net",
        Key: { user_id, document_id },
        UpdateExpression:
          "set content = :content, media_item = :media_item, hero_img = :hero_img, playlist = :playlist, ordinal = :ordinal",
        ExpressionAttributeValues: {
          ":content": content,
          ":hero_img": hero_img || null,
          ":media_item": media_item || null,
          ":playlist": playlist || null,
          ":ordinal": ordinal || null,
        },
        ReturnValues: "UPDATED_NEW",
      })
    );

    const contentDocument = { user_id, document_id, ...result.Attributes };
    res.status(200).json({ message: "Post updated successfully", ...contentDocument });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: "Failed to update post" });
  }
};

export default withAuth(updateHandler);
