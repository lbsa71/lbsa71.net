/**
 * Storage configuration types
 */

export type StorageType = 'dynamodb' | 'json';

export interface DynamoDBOptions {
  tableName: string;
  backupTableName: string;
}

export interface JSONFileOptions {
  filePath: string;
  backupPath: string;
}

export interface StorageConfig {
  type: StorageType;
  options: DynamoDBOptions | JSONFileOptions;
}

export interface AppConfig {
  storage?: StorageConfig;
  // Other config sections can be added here in the future
}

/**
 * Type guards for storage options
 */
export function isDynamoDBOptions(options: DynamoDBOptions | JSONFileOptions): options is DynamoDBOptions {
  return 'tableName' in options && 'backupTableName' in options;
}

export function isJSONFileOptions(options: DynamoDBOptions | JSONFileOptions): options is JSONFileOptions {
  return 'filePath' in options && 'backupPath' in options;
}
