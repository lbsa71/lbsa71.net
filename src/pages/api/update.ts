import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withAuth } from "./lib/withAuth";
import { getRepository } from "@/lib/storage/repositoryFactory";
import { ContentDocument } from "@/lib/getSite";

const updateHandler = async (req: VercelRequest, res: VercelResponse) => {
  const {
    user_id,
    document_id,
    content,
    hero_img,
    media_item,
    playlist,
    ordinal,
    title,
    info,
  } = req.body;

  if (!user_id || !document_id || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const repository = getRepository();

    const document: ContentDocument = {
      user_id,
      document_id,
      content,
      hero_img: hero_img || '',
      media_item: media_item || '',
      playlist: playlist || '',
      ordinal: ordinal || '',
      title: title || '',
      ...(info !== undefined && info !== null ? { info } : {}),
    };

    // Create backup before update
    await repository.backupDocument(document);

    // Update document
    const updatedDocument = await repository.updateDocument(document);

    res.status(200).json({ message: "Post updated successfully", ...updatedDocument });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: "Failed to update post" });
  }
};

export default withAuth(updateHandler);
