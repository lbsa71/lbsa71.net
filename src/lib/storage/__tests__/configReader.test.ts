import * as fs from 'fs';
import * as path from 'path';
import { readStorageConfig, getDefaultStorageConfig } from '../configReader';
import { StorageConfig } from '../types';

// Mock fs module
jest.mock('fs');

const mockedFs = fs as jest.Mocked<typeof fs>;

describe('configReader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDefaultStorageConfig', () => {
    it('should return DynamoDB config as default', () => {
      const config = getDefaultStorageConfig();

      expect(config.type).toBe('dynamodb');
      expect(config.options).toHaveProperty('tableName');
      expect(config.options).toHaveProperty('backupTableName');
    });
  });

  describe('readStorageConfig', () => {
    it('should return default config when config.json does not exist', () => {
      mockedFs.existsSync.mockReturnValue(false);

      const config = readStorageConfig();

      expect(config.type).toBe('dynamodb');
    });

    it('should return default config when config.json has no storage section', () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify({}));

      const config = readStorageConfig();

      expect(config.type).toBe('dynamodb');
    });

    it('should read and return JSON storage config from config.json', () => {
      const configContent = {
        storage: {
          type: 'json',
          options: {
            filePath: 'data/test.json',
            backupPath: 'data/backups/'
          }
        }
      };

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(configContent));

      const config = readStorageConfig();

      expect(config.type).toBe('json');
      expect(config.options).toEqual({
        filePath: 'data/test.json',
        backupPath: 'data/backups/'
      });
    });

    it('should read and return DynamoDB storage config from config.json', () => {
      const configContent = {
        storage: {
          type: 'dynamodb',
          options: {
            tableName: 'my_table',
            backupTableName: 'my_backup_table'
          }
        }
      };

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(configContent));

      const config = readStorageConfig();

      expect(config.type).toBe('dynamodb');
      expect(config.options).toEqual({
        tableName: 'my_table',
        backupTableName: 'my_backup_table'
      });
    });

    it('should throw error for invalid storage type', () => {
      const configContent = {
        storage: {
          type: 'invalid',
          options: {}
        }
      };

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(configContent));

      expect(() => readStorageConfig()).toThrow('Invalid storage type');
    });

    it('should throw error for malformed JSON', () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue('{ invalid json }');

      expect(() => readStorageConfig()).toThrow();
    });
  });
});
