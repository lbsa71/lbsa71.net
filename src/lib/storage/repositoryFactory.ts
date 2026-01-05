import { DocumentRepository } from './DocumentRepository';
import { DynamoDBRepository } from './DynamoDBRepository';
import { JSONFileRepository } from './JSONFileRepository';
import { isDynamoDBOptions, isJSONFileOptions, StorageConfig } from './types';

/**
 * Lazy-load config reader to avoid importing Node.js 'fs' module in browser
 */
function readConfig(): StorageConfig {
  // This will only be called server-side (in API routes)
  const { readStorageConfig } = require('./configReader');
  return readStorageConfig();
}

/**
 * Get the appropriate repository based on configuration
 * Reads config.json and returns either DynamoDBRepository or JSONFileRepository
 */
export function getRepository(): DocumentRepository {
  const config = readConfig();

  switch (config.type) {
    case 'dynamodb': {
      if (!isDynamoDBOptions(config.options)) {
        throw new Error('Invalid DynamoDB configuration options');
      }
      // Lazy-load dynamoDb only when needed (to avoid requiring AWS env vars for JSON storage)
      const { dynamoDb } = require('../dynamodb');
      return new DynamoDBRepository(
        config.options.tableName,
        config.options.backupTableName,
        dynamoDb
      );
    }

    case 'json':
      if (!isJSONFileOptions(config.options)) {
        throw new Error('Invalid JSON file configuration options');
      }
      return new JSONFileRepository(
        config.options.filePath,
        config.options.backupPath
      );

    default:
      throw new Error(`Unsupported storage type: ${config.type}`);
  }
}
