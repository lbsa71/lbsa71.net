import { VercelRequest, VercelResponse } from "@vercel/node";
import { ContentDocument } from "@/lib/getSite";
import { localDocuments } from "./localDocuments";
import { getRepository } from "@/lib/storage/repositoryFactory";

export const listDocuments = async (user_id: string) => {
  if (user_id === "local") {
    return localDocuments;
  }

  const repository = getRepository();
  return await repository.listDocuments(user_id);
};

const handler = async (req: VercelRequest, res: VercelResponse) => {
  const { user_id } = req.query;

  if (typeof user_id !== "string") {
    return res.status(400).json({ error: "Invalid query" });
  }

  try {
    const items = await listDocuments(user_id);

    if (items) {
      res.status(200).json(items);
    } else {
      res.status(404).json({ message: "No documents found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to query documents" });
  }
};

export default handler;
