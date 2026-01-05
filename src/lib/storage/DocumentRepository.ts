import { ContentDocument, Config } from '../getSite';

/**
 * Repository interface for document storage operations
 * Abstracts the underlying storage mechanism (DynamoDB, JSON file, etc.)
 */
export interface DocumentRepository {
  /**
   * Get a single document by user_id and document_id
   */
  getDocument(user_id: string, document_id: string): Promise<ContentDocument | null>;

  /**
   * List all documents for a user
   */
  listDocuments(user_id: string): Promise<ContentDocument[]>;

  /**
   * Create a new document
   */
  createDocument(document: ContentDocument): Promise<ContentDocument>;

  /**
   * Update an existing document
   */
  updateDocument(document: ContentDocument): Promise<ContentDocument>;

  /**
   * Delete a document
   */
  deleteDocument(user_id: string, document_id: string): Promise<void>;

  /**
   * Get site configuration
   */
  getConfig(): Promise<Config>;

  /**
   * Update site configuration
   */
  updateConfig(config: Config): Promise<void>;

  /**
   * Backup a document before destructive operations
   */
  backupDocument(document: ContentDocument): Promise<void>;
}
