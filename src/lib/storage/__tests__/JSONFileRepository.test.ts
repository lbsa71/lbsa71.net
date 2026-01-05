import { JSONFileRepository } from '../JSONFileRepository';
import { ContentDocument, Config } from '@/lib/getSite';
import * as jsonFileIO from '../jsonFileIO';
import * as dynamoDBFormatParser from '../dynamoDBFormatParser';

// Mock the file I/O module
jest.mock('../jsonFileIO');
jest.mock('../dynamoDBFormatParser');

const mockedJsonFileIO = jsonFileIO as jest.Mocked<typeof jsonFileIO>;
const mockedParser = dynamoDBFormatParser as jest.Mocked<typeof dynamoDBFormatParser>;

describe('JSONFileRepository', () => {
  const testFilePath = '/test/data.json';
  const testBackupPath = '/test/backups/';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should load and index documents on creation', () => {
      const mockLines = [
        '{"Item":{"user_id":{"S":"user1"},"document_id":{"S":"doc1"}}}',
        '{"Item":{"user_id":{"S":"user2"},"document_id":{"S":"doc2"}}}'
      ];

      const mockDocs: ContentDocument[] = [
        {
          user_id: 'user1',
          document_id: 'doc1',
          content: '',
          hero_img: '',
          media_item: '',
          ordinal: '1',
          playlist: '',
          title: ''
        },
        {
          user_id: 'user2',
          document_id: 'doc2',
          content: '',
          hero_img: '',
          media_item: '',
          ordinal: '1',
          playlist: '',
          title: ''
        }
      ];

      mockedJsonFileIO.readJSONFile.mockReturnValue(mockLines);
      mockedParser.parseDynamoDBExportLine
        .mockReturnValueOnce(mockDocs[0])
        .mockReturnValueOnce(mockDocs[1]);

      const repository = new JSONFileRepository(testFilePath, testBackupPath);

      expect(mockedJsonFileIO.readJSONFile).toHaveBeenCalledWith(testFilePath);
      expect(mockedParser.parseDynamoDBExportLine).toHaveBeenCalledTimes(2);
    });
  });

  describe('getDocument', () => {
    it('should get a document by user_id and document_id', async () => {
      const mockDoc: ContentDocument = {
        user_id: 'user1',
        document_id: 'doc1',
        content: 'Test content',
        hero_img: 'image.jpg',
        media_item: 'audio.mp3',
        ordinal: '1',
        playlist: 'test',
        title: 'Test Doc'
      };

      mockedJsonFileIO.readJSONFile.mockReturnValue(['{"Item":{}}']);
      mockedParser.parseDynamoDBExportLine.mockReturnValue(mockDoc);

      const repository = new JSONFileRepository(testFilePath, testBackupPath);
      const result = await repository.getDocument('user1', 'doc1');

      expect(result).toEqual(mockDoc);
    });

    it('should return null if document not found', async () => {
      mockedJsonFileIO.readJSONFile.mockReturnValue([]);

      const repository = new JSONFileRepository(testFilePath, testBackupPath);
      const result = await repository.getDocument('user1', 'nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('listDocuments', () => {
    it('should list all documents for a user', async () => {
      const mockDocs: ContentDocument[] = [
        {
          user_id: 'user1',
          document_id: 'doc1',
          content: 'Content 1',
          hero_img: '',
          media_item: '',
          ordinal: '1',
          playlist: 'test',
          title: 'Doc 1'
        },
        {
          user_id: 'user1',
          document_id: 'doc2',
          content: 'Content 2',
          hero_img: '',
          media_item: '',
          ordinal: '2',
          playlist: 'test',
          title: 'Doc 2'
        }
      ];

      mockedJsonFileIO.readJSONFile.mockReturnValue(['{}', '{}']);
      mockedParser.parseDynamoDBExportLine
        .mockReturnValueOnce(mockDocs[0])
        .mockReturnValueOnce(mockDocs[1]);

      const repository = new JSONFileRepository(testFilePath, testBackupPath);
      const result = await repository.listDocuments('user1');

      expect(result).toHaveLength(2);
      expect(result).toEqual(mockDocs);
    });

    it('should return empty array if user has no documents', async () => {
      mockedJsonFileIO.readJSONFile.mockReturnValue([]);

      const repository = new JSONFileRepository(testFilePath, testBackupPath);
      const result = await repository.listDocuments('nonexistent');

      expect(result).toEqual([]);
    });
  });

  describe('createDocument', () => {
    it('should create a new document', async () => {
      const newDoc: ContentDocument = {
        user_id: 'user1',
        document_id: 'doc1',
        content: 'New content',
        hero_img: '',
        media_item: '',
        ordinal: '1',
        playlist: 'test',
        title: 'New Doc'
      };

      mockedJsonFileIO.readJSONFile.mockReturnValue([]);
      mockedJsonFileIO.writeJSONFile.mockImplementation(() => {});
      mockedParser.serializeToDynamoDBFormat.mockReturnValue('{"Item":{}}');

      const repository = new JSONFileRepository(testFilePath, testBackupPath);
      const result = await repository.createDocument(newDoc);

      expect(result).toEqual(newDoc);
      expect(mockedJsonFileIO.writeJSONFile).toHaveBeenCalledWith(
        testFilePath,
        expect.arrayContaining(['{"Item":{}}'])
      );
    });
  });

  describe('updateDocument', () => {
    it('should update an existing document', async () => {
      const existingDoc: ContentDocument = {
        user_id: 'user1',
        document_id: 'doc1',
        content: 'Original content',
        hero_img: '',
        media_item: '',
        ordinal: '1',
        playlist: 'test',
        title: 'Original'
      };

      const updatedDoc: ContentDocument = {
        ...existingDoc,
        content: 'Updated content',
        title: 'Updated'
      };

      mockedJsonFileIO.readJSONFile.mockReturnValue(['{"Item":{}}']);
      mockedParser.parseDynamoDBExportLine.mockReturnValue(existingDoc);
      mockedJsonFileIO.writeJSONFile.mockImplementation(() => {});
      mockedParser.serializeToDynamoDBFormat.mockReturnValue('{"Item":{}}');

      const repository = new JSONFileRepository(testFilePath, testBackupPath);
      const result = await repository.updateDocument(updatedDoc);

      expect(result).toEqual(updatedDoc);
      expect(mockedJsonFileIO.writeJSONFile).toHaveBeenCalled();
    });
  });

  describe('deleteDocument', () => {
    it('should delete a document', async () => {
      const doc: ContentDocument = {
        user_id: 'user1',
        document_id: 'doc1',
        content: 'Content',
        hero_img: '',
        media_item: '',
        ordinal: '1',
        playlist: 'test',
        title: 'Doc'
      };

      mockedJsonFileIO.readJSONFile.mockReturnValue(['{"Item":{}}']);
      mockedParser.parseDynamoDBExportLine.mockReturnValue(doc);
      mockedJsonFileIO.writeJSONFile.mockImplementation(() => {});
      mockedParser.serializeToDynamoDBFormat.mockReturnValue('{"Item":{}}');

      const repository = new JSONFileRepository(testFilePath, testBackupPath);
      await repository.deleteDocument('user1', 'doc1');

      expect(mockedJsonFileIO.writeJSONFile).toHaveBeenCalled();
      // Verify document is removed
      const result = await repository.getDocument('user1', 'doc1');
      expect(result).toBeNull();
    });
  });

  describe('getConfig', () => {
    it('should get site configuration', async () => {
      const mockConfig: Config = {
        defaultSite: {
          user_id: 'default',
          urls: [],
          admin_user_id: 'admin'
        },
        sites: []
      };

      const configDoc = {
        user_id: '_root',
        document_id: 'config',
        ...mockConfig
      };

      mockedJsonFileIO.readJSONFile.mockReturnValue(['{"Item":{}}']);
      mockedParser.parseDynamoDBExportLine.mockReturnValue(configDoc);

      const repository = new JSONFileRepository(testFilePath, testBackupPath);
      const result = await repository.getConfig();

      expect(result).toHaveProperty('defaultSite');
      expect(result).toHaveProperty('sites');
    });

    it('should throw error if config not found', async () => {
      mockedJsonFileIO.readJSONFile.mockReturnValue([]);

      const repository = new JSONFileRepository(testFilePath, testBackupPath);

      await expect(repository.getConfig()).rejects.toThrow('Site configuration not found');
    });
  });

  describe('updateConfig', () => {
    it('should update site configuration', async () => {
      const mockConfig: Config = {
        defaultSite: {
          user_id: 'default',
          urls: [],
          admin_user_id: 'admin'
        },
        sites: []
      };

      mockedJsonFileIO.readJSONFile.mockReturnValue([]);
      mockedJsonFileIO.writeJSONFile.mockImplementation(() => {});
      mockedParser.serializeToDynamoDBFormat.mockReturnValue('{"Item":{}}');

      const repository = new JSONFileRepository(testFilePath, testBackupPath);
      await repository.updateConfig(mockConfig);

      expect(mockedJsonFileIO.writeJSONFile).toHaveBeenCalled();
    });
  });

  describe('backupDocument', () => {
    it('should backup a document to backup path', async () => {
      const doc: ContentDocument = {
        user_id: 'user1',
        document_id: 'doc1',
        content: 'Content to backup',
        hero_img: '',
        media_item: '',
        ordinal: '1',
        playlist: 'test',
        title: 'Backup Doc'
      };

      mockedJsonFileIO.readJSONFile.mockReturnValue([]);
      mockedJsonFileIO.writeJSONFile.mockImplementation(() => {});
      mockedParser.serializeToDynamoDBFormat.mockReturnValue('{"Item":{}}');

      const repository = new JSONFileRepository(testFilePath, testBackupPath);
      await repository.backupDocument(doc);

      expect(mockedJsonFileIO.writeJSONFile).toHaveBeenCalledTimes(1);
      const callArgs = mockedJsonFileIO.writeJSONFile.mock.calls[0];
      expect(callArgs[0]).toContain('backup-user1-doc1');
      expect(callArgs[1]).toEqual(expect.any(Array));
    });
  });
});
