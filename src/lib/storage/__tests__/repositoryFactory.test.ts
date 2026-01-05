import { getRepository } from '../repositoryFactory';
import { DynamoDBRepository } from '../DynamoDBRepository';
import { JSONFileRepository } from '../JSONFileRepository';
import * as configReader from '../configReader';

// Mock dependencies
jest.mock('../configReader');
jest.mock('../DynamoDBRepository');
jest.mock('../JSONFileRepository');
jest.mock('@/lib/dynamodb', () => ({
  dynamoDb: {}
}));

const mockedConfigReader = configReader as jest.Mocked<typeof configReader>;

describe('repositoryFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRepository', () => {
    it('should return DynamoDBRepository when config type is dynamodb', () => {
      mockedConfigReader.readStorageConfig.mockReturnValue({
        type: 'dynamodb',
        options: {
          tableName: 'test_table',
          backupTableName: 'test_backup_table'
        }
      });

      const repository = getRepository();

      expect(repository).toBeInstanceOf(DynamoDBRepository);
    });

    it('should return JSONFileRepository when config type is json', () => {
      mockedConfigReader.readStorageConfig.mockReturnValue({
        type: 'json',
        options: {
          filePath: 'data/test.json',
          backupPath: 'data/backups/'
        }
      });

      const repository = getRepository();

      expect(repository).toBeInstanceOf(JSONFileRepository);
    });

    it('should use default DynamoDB config when no config file exists', () => {
      mockedConfigReader.readStorageConfig.mockReturnValue({
        type: 'dynamodb',
        options: {
          tableName: 'lbsa71_net',
          backupTableName: 'lbsa71_net_backup'
        }
      });

      const repository = getRepository();

      expect(repository).toBeInstanceOf(DynamoDBRepository);
    });

    it('should throw error for invalid storage type', () => {
      mockedConfigReader.readStorageConfig.mockReturnValue({
        type: 'invalid' as any,
        options: {} as any
      });

      expect(() => getRepository()).toThrow('Unsupported storage type');
    });

    it('should pass correct options to DynamoDBRepository', () => {
      const mockConfig = {
        type: 'dynamodb' as const,
        options: {
          tableName: 'custom_table',
          backupTableName: 'custom_backup'
        }
      };

      mockedConfigReader.readStorageConfig.mockReturnValue(mockConfig);

      getRepository();

      expect(DynamoDBRepository).toHaveBeenCalledWith(
        'custom_table',
        'custom_backup',
        expect.anything()
      );
    });

    it('should pass correct options to JSONFileRepository', () => {
      const mockConfig = {
        type: 'json' as const,
        options: {
          filePath: 'custom/path.json',
          backupPath: 'custom/backups/'
        }
      };

      mockedConfigReader.readStorageConfig.mockReturnValue(mockConfig);

      getRepository();

      expect(JSONFileRepository).toHaveBeenCalledWith(
        'custom/path.json',
        'custom/backups/'
      );
    });
  });
});
