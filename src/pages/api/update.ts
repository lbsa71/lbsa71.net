import type { VercelRequest, VercelResponse } from "@vercel/node";
import { UpdateCommand, PutCommand, dynamoDb, fetchSiteByUserId } from "@/lib/dynamodb";
import { jwtDecode } from "jwt-decode";

type User = {
  id: string;
  name: string;
  email: string;
  sub: string;
};

const updateHandler = async (req: VercelRequest, res: VercelResponse) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authorization.split(" ")[1];

  const user = jwtDecode<User>(token);

  const {
    user_id,
    document_id,
    content,
    hero_img,
    media_item,
    playlist,
    ordinal,
  } = req.body;

  const site = await fetchSiteByUserId(user_id);
  const admin_user_id = site.admin_user_id;

  if (!user_id || !document_id || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (user.sub !== admin_user_id) {
    return res.status(403).json({ error: "Forbidden: You do not have access to update this document" });
  }

  try {
    const version_id = new Date().toISOString();

    await dynamoDb.send(
      new PutCommand({
        TableName: "lbsa71_net_backup",
        Item: {
          user_id,
          document_id,
          versionId: version_id,
          content,
          hero_img,
          media_item,
          playlist,
          ordinal,
        },
      })
    );

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

export default updateHandler;
