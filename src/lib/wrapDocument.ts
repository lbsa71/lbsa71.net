import { ContentDocument } from "@/types/core";
import { parseMarkdown } from "./markdownParser";
import { DBDocument } from "@/lib/dynamodb";

export const wrapDocument = (doc: DBDocument): ContentDocument => {
  let { content, title } = doc;

  if (!title) {
    const match = content.match(/^#\s+(.*)/m);
    title = match ? match[1] : doc.document_id;
  }

  const { nodes } = parseMarkdown(content);

  return {
    ...doc,
    content,
    title : title ?? "",
    nodes,
    createdAt: doc.createdAt || new Date().toISOString(),
    updatedAt: doc.updatedAt || new Date().toISOString(),

  };
};
