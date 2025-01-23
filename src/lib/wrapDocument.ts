import { ContentDocument } from "@/types/core";
import { parseMarkdown } from "./markdownParser";

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

export const wrapDocument = (doc: DBDocument): ContentDocument => {
  let { content, title } = doc;

  if (!title) {
    const match = content.match(/^#\s+(.*)/m);
    title = match ? match[1] : doc.id;
  }

  const { nodes } = parseMarkdown(content);

  return {
    id: doc.id,
    userId: doc.userId,
    content,
    title,
    heroImage: doc.heroImage,
    mediaItem: doc.mediaItem,
    playlist: doc.playlist,
    ordinal: doc.ordinal,
    nodes,
    createdAt: doc.createdAt || new Date().toISOString(),
    updatedAt: doc.updatedAt || new Date().toISOString(),
  };
};
