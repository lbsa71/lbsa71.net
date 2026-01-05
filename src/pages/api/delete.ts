import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withAuth } from "./lib/withAuth";
import { getRepository } from "@/lib/storage/repositoryFactory";

const deleteHandler = async (req: VercelRequest, res: VercelResponse) => {
  const { user_id, document_id } = req.body;

  if (!user_id || !document_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const repository = getRepository();

    // Get current document data for backup
    const document = await repository.getDocument(user_id, document_id);
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Create backup
    await repository.backupDocument(document);

    // Delete the document
    await repository.deleteDocument(user_id, document_id);

    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete post" });
  }
};

export default withAuth(deleteHandler);
