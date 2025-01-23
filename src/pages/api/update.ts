import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb, DBDocument } from "@/lib/dynamodb";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { ContentDocument } from "@/types/core";
import { ApiResponse, UpdateDocumentRequest } from "@/types/api";
import { wrapDocument } from "@/lib/wrapDocument";

const updateHandler = async (req: VercelRequest, res: VercelResponse) => {
  const { user_id, adminUserId, documentId, content, heroImage, mediaItem, playlist, ordinal } = req.body as UpdateDocumentRequest;

  if (!user_id || !documentId || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const now = new Date().toISOString();

  const updateCommand = new UpdateCommand({
    TableName: "lbsa71_net",
    Key: {
      user_id: user_id,
      document_id: documentId,
    },
    UpdateExpression:
      "SET content = :content, hero_img = :heroImage, media_item = :mediaItem, playlist = :playlist, ordinal = :ordinal, updatedAt = :updatedAt",
    ExpressionAttributeValues: {
      ":content": content,
      ":heroImage": heroImage || null,
      ":mediaItem": mediaItem || null,
      ":playlist": playlist || null,
      ":ordinal": ordinal || null,
      ":updatedAt": now,
    },
    ReturnValues: "ALL_NEW",
  });

  try {
    const data = await dynamoDb.send(updateCommand);
    if (!data.Attributes) {
      throw new Error("No data returned from update operation");
    }

    const document = wrapDocument(data.Attributes as DBDocument);
    res.status(200).json({ data: document });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update document" });
  }
};

export default updateHandler;
