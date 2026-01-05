import { DocumentRepository } from './DocumentRepository';
import { ContentDocument, Config } from '../getSite';
import { readJSONFile, writeJSONFile } from './jsonFileIO';
import { parseDynamoDBExportLine, serializeToDynamoDBFormat } from './dynamoDBFormatParser';
import { JSONFileIndex } from './jsonFileIndex';

/**
 * JSON File implementation of DocumentRepository
 * Stores documents in newline-delimited JSON format with DynamoDB export structure
 */
export class JSONFileRepository implements DocumentRepository {
  private index: JSONFileIndex;
  private filePath: string;
  private backupPath: string;

  constructor(filePath: string, backupPath: string) {
    this.filePath = filePath;
    this.backupPath = backupPath;

    // Load and index all documents on initialization
    const lines = readJSONFile(filePath);
    const documents = lines.map(line => parseDynamoDBExportLine(line) as ContentDocument);
    this.index = new JSONFileIndex(documents);
  }

  async getDocument(user_id: string, document_id: string): Promise<ContentDocument | null> {
    return this.index.getDocument(user_id, document_id);
  }

  async listDocuments(user_id: string): Promise<ContentDocument[]> {
    return this.index.listDocuments(user_id);
  }

  async createDocument(document: ContentDocument): Promise<ContentDocument> {
    // Add to index
    this.index.addDocument(document);

    // Write to file
    await this.writeAllDocuments();

    return document;
  }

  async updateDocument(document: ContentDocument): Promise<ContentDocument> {
    // Update in index
    this.index.updateDocument(document);

    // Write to file
    await this.writeAllDocuments();

    return document;
  }

  async deleteDocument(user_id: string, document_id: string): Promise<void> {
    // Remove from index
    this.index.deleteDocument(user_id, document_id);

    // Write to file
    await this.writeAllDocuments();
  }

  async getConfig(): Promise<Config> {
    const configDoc = this.index.getDocument('_root', 'config');

    if (!configDoc) {
      throw new Error('Site configuration not found');
    }

    // Extract config from document (remove user_id and document_id)
    const { user_id, document_id, content, hero_img, media_item, ordinal, playlist, title, ...config } = configDoc as any;
    return config as Config;
  }

  async updateConfig(config: Config): Promise<void> {
    const configDoc: any = {
      user_id: '_root',
      document_id: 'config',
      ...config
    };

    // Update in index
    this.index.updateDocument(configDoc as ContentDocument);

    // Write to file
    await this.writeAllDocuments();
  }

  async backupDocument(document: ContentDocument): Promise<void> {
    // Lazy-load path to avoid bundling in client-side code
    const path = require('path');

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupFileName = `backup-${document.user_id}-${document.document_id}-${timestamp}.json`;
    const backupFilePath = path.join(this.backupPath, backupFileName);

    // Create backup with version info
    const backupDoc = {
      ...document,
      versionId: new Date().toISOString()
    };

    const line = serializeToDynamoDBFormat(backupDoc);
    writeJSONFile(backupFilePath, [line]);
  }

  /**
   * Write all documents from index back to the file
   * This is called after create, update, or delete operations
   */
  private async writeAllDocuments(): Promise<void> {
    const allDocuments = this.index.getAllDocuments();
    const lines = allDocuments.map(doc => serializeToDynamoDBFormat(doc));
    writeJSONFile(this.filePath, lines);
  }
}
