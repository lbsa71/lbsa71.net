import { StorageConfig, AppConfig } from './types';

/**
 * Get default storage configuration (DynamoDB)
 */
export function getDefaultStorageConfig(): StorageConfig {
  return {
    type: 'dynamodb',
    options: {
      tableName: 'lbsa71_net',
      backupTableName: 'lbsa71_net_backup'
    }
  };
}

/**
 * Read storage configuration from config.json
 * Returns default DynamoDB config if file doesn't exist or storage section is missing
 */
export function readStorageConfig(configPath?: string): StorageConfig {
  // Lazy-load fs and path to avoid bundling in client-side code
  const fs = require('fs');
  const path = require('path');

  const CONFIG_FILE_PATH = configPath || path.join(process.cwd(), 'config.json');

  // Check if config file exists
  if (!fs.existsSync(CONFIG_FILE_PATH)) {
    return getDefaultStorageConfig();
  }

  try {
    // Read and parse config file
    const fileContent = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
    const appConfig: AppConfig = JSON.parse(fileContent);

    // Check if storage section exists
    if (!appConfig.storage) {
      return getDefaultStorageConfig();
    }

    // Validate storage type
    if (appConfig.storage.type !== 'dynamodb' && appConfig.storage.type !== 'json') {
      throw new Error(`Invalid storage type: ${appConfig.storage.type}. Must be 'dynamodb' or 'json'.`);
    }

    return appConfig.storage;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse config.json: ${error.message}`);
    }
    throw error;
  }
}
