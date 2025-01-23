import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from "@/lib/dynamodb";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { ContentDocument } from "@/types/core";
import { ApiResponse, UpdateDocumentRequest } from "@/types/api";
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

const updateHandler = async (req: VercelRequest, res: VercelResponse) => {
  const { userId, adminUserId, documentId, content, heroImage, mediaItem, playlist, ordinal } = req.body as UpdateDocumentRequest;

  if (!userId || !documentId || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const now = new Date().toISOString();

  const updateCommand = new UpdateCommand({
    TableName: "lbsa71_net",
    Key: {
      user_id: userId,
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

    // Convert from DynamoDB format to our new type system
    const dbDoc: DBDocument = {
      id: data.Attributes.document_id,
      userId: data.Attributes.user_id,
      content: data.Attributes.content,
      title: data.Attributes.title,
      heroImage: data.Attributes.hero_img,
      mediaItem: data.Attributes.media_item,
      playlist: data.Attributes.playlist,
      ordinal: data.Attributes.ordinal,
      createdAt: data.Attributes.createdAt,
      updatedAt: data.Attributes.updatedAt,
    };

    const document = wrapDocument(dbDoc);
    res.status(200).json({ data: document });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update document" });
  }
};

export default updateHandler;
