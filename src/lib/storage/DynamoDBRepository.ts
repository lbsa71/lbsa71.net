import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { DocumentRepository } from './DocumentRepository';
import { ContentDocument, Config } from '../getSite';

/**
 * DynamoDB implementation of DocumentRepository
 */
export class DynamoDBRepository implements DocumentRepository {
  constructor(
    private tableName: string,
    private backupTableName: string,
    private client: DynamoDBDocumentClient
  ) {}

  async getDocument(user_id: string, document_id: string): Promise<ContentDocument | null> {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          user_id,
          document_id,
        },
      })
    );

    return (result.Item as ContentDocument) || null;
  }

  async listDocuments(user_id: string): Promise<ContentDocument[]> {
    const result = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'user_id = :uid',
        ExpressionAttributeValues: {
          ':uid': user_id,
        },
      })
    );

    return (result.Items as ContentDocument[]) || [];
  }

  async createDocument(document: ContentDocument): Promise<ContentDocument> {
    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: document,
      })
    );

    return document;
  }

  async updateDocument(document: ContentDocument): Promise<ContentDocument> {
    const { user_id, document_id, content, hero_img, media_item, playlist, ordinal, title } = document;

    const result = await this.client.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { user_id, document_id },
        UpdateExpression:
          'set content = :content, media_item = :media_item, hero_img = :hero_img, playlist = :playlist, ordinal = :ordinal, title = :title',
        ExpressionAttributeValues: {
          ':content': content,
          ':hero_img': hero_img || null,
          ':media_item': media_item || null,
          ':playlist': playlist || null,
          ':ordinal': ordinal || null,
          ':title': title || null,
        },
        ReturnValues: 'ALL_NEW',
      })
    );

    return {
      user_id,
      document_id,
      ...result.Attributes,
    } as ContentDocument;
  }

  async deleteDocument(user_id: string, document_id: string): Promise<void> {
    await this.client.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: {
          user_id,
          document_id,
        },
      })
    );
  }

  async getConfig(): Promise<Config> {
    const result = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'user_id = :uid and document_id = :did',
        ExpressionAttributeValues: {
          ':uid': '_root',
          ':did': 'config',
        },
      })
    );

    if (!result.Items?.[0]) {
      throw new Error('Site configuration not found');
    }

    return result.Items[0] as Config;
  }

  async updateConfig(config: Config): Promise<void> {
    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          user_id: '_root',
          document_id: 'config',
          ...config,
        },
      })
    );
  }

  async backupDocument(document: ContentDocument): Promise<void> {
    const versionId = new Date().toISOString();

    await this.client.send(
      new PutCommand({
        TableName: this.backupTableName,
        Item: {
          user_id: document.user_id,
          document_id: document.document_id,
          versionId,
          content: document.content,
          hero_img: document.hero_img,
          media_item: document.media_item,
          playlist: document.playlist,
          ordinal: document.ordinal,
          title: document.title,
        },
      })
    );
  }
}
