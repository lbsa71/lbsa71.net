import { ContentDocument, Optional } from "@/lib/getSite";

export const wrapDocument = (doc: Optional<ContentDocument, "title">) => {
  let { content, title, document_id } = doc;

  if (!title) {
    const match = content.match(/^#\s+(.*)/m);
    if (match) {
      title = match[1];
    } else {
      title = document_id;
    }
  }

  return {
    ...doc,
    title,
  } as ContentDocument;
};
