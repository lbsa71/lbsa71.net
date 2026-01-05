import { ContentDocument } from '../getSite';

/**
 * In-memory index for fast document lookups
 * Structure: Map<user_id, Map<document_id, document>>
 */
export type DocumentIndex = Map<string, Map<string, ContentDocument>>;

/**
 * Build an index from an array of documents
 */
export function buildIndex(documents: ContentDocument[]): DocumentIndex {
  const index: DocumentIndex = new Map();

  for (const doc of documents) {
    if (!index.has(doc.user_id)) {
      index.set(doc.user_id, new Map());
    }
    index.get(doc.user_id)!.set(doc.document_id, doc);
  }

  return index;
}

/**
 * JSON File Index class for managing document lookups
 */
export class JSONFileIndex {
  private index: DocumentIndex;

  constructor(documents: ContentDocument[]) {
    this.index = buildIndex(documents);
  }

  /**
   * Get a single document by user_id and document_id
   */
  getDocument(user_id: string, document_id: string): ContentDocument | null {
    const userDocs = this.index.get(user_id);
    if (!userDocs) {
      return null;
    }
    return userDocs.get(document_id) || null;
  }

  /**
   * List all documents for a user
   */
  listDocuments(user_id: string): ContentDocument[] {
    const userDocs = this.index.get(user_id);
    if (!userDocs) {
      return [];
    }
    return Array.from(userDocs.values());
  }

  /**
   * Add a document to the index
   */
  addDocument(document: ContentDocument): void {
    if (!this.index.has(document.user_id)) {
      this.index.set(document.user_id, new Map());
    }
    this.index.get(document.user_id)!.set(document.document_id, document);
  }

  /**
   * Update a document in the index
   */
  updateDocument(document: ContentDocument): void {
    // Same as add - overwrites if exists
    this.addDocument(document);
  }

  /**
   * Delete a document from the index
   */
  deleteDocument(user_id: string, document_id: string): void {
    const userDocs = this.index.get(user_id);
    if (userDocs) {
      userDocs.delete(document_id);
      // Clean up empty user maps
      if (userDocs.size === 0) {
        this.index.delete(user_id);
      }
    }
  }

  /**
   * Get all documents from the index
   */
  getAllDocuments(): ContentDocument[] {
    const allDocs: ContentDocument[] = [];
    this.index.forEach((userDocs) => {
      userDocs.forEach((doc) => {
        allDocs.push(doc);
      });
    });
    return allDocs;
  }
}
