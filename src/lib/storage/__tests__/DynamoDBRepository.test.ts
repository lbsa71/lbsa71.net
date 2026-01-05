import { DynamoDBRepository } from '../DynamoDBRepository';
import { DynamoDBDocumentClient, GetCommand, QueryCommand, PutCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { ContentDocument, Config } from '@/lib/getSite';

// Mock the DynamoDB client
jest.mock('@aws-sdk/lib-dynamodb');

const mockSend = jest.fn();
const mockDynamoDBClient = {
  send: mockSend,
} as unknown as DynamoDBDocumentClient;

describe('DynamoDBRepository', () => {
  let repository: DynamoDBRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new DynamoDBRepository('lbsa71_net', 'lbsa71_net_backup', mockDynamoDBClient);
  });

  describe('getDocument', () => {
    it('should get a document by user_id and document_id', async () => {
      const mockDocument: ContentDocument = {
        user_id: 'user1',
        document_id: 'doc1',
        content: 'Test content',
        hero_img: 'image.jpg',
        media_item: 'audio.mp3',
        ordinal: '1',
        playlist: 'test',
        title: 'Test Doc'
      };

      mockSend.mockResolvedValueOnce({ Item: mockDocument });

      const result = await repository.getDocument('user1', 'doc1');

      expect(result).toEqual(mockDocument);
      expect(mockSend).toHaveBeenCalledWith(expect.any(GetCommand));
    });

    it('should return null if document not found', async () => {
      mockSend.mockResolvedValueOnce({ Item: undefined });

      const result = await repository.getDocument('user1', 'nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('listDocuments', () => {
    it('should list all documents for a user', async () => {
      const mockDocuments: ContentDocument[] = [
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

      mockSend.mockResolvedValueOnce({ Items: mockDocuments });

      const result = await repository.listDocuments('user1');

      expect(result).toEqual(mockDocuments);
      expect(mockSend).toHaveBeenCalledWith(expect.any(QueryCommand));
    });

    it('should return empty array if no documents found', async () => {
      mockSend.mockResolvedValueOnce({ Items: undefined });

      const result = await repository.listDocuments('user1');

      expect(result).toEqual([]);
    });
  });

  describe('createDocument', () => {
    it('should create a new document', async () => {
      const newDocument: ContentDocument = {
        user_id: 'user1',
        document_id: 'doc1',
        content: 'New content',
        hero_img: '',
        media_item: '',
        ordinal: '1',
        playlist: 'test',
        title: 'New Doc'
      };

      mockSend.mockResolvedValueOnce({});

      const result = await repository.createDocument(newDocument);

      expect(result).toEqual(newDocument);
      expect(mockSend).toHaveBeenCalledWith(expect.any(PutCommand));
    });
  });

  describe('updateDocument', () => {
    it('should update an existing document', async () => {
      const updatedDocument: ContentDocument = {
        user_id: 'user1',
        document_id: 'doc1',
        content: 'Updated content',
        hero_img: 'new-image.jpg',
        media_item: 'new-audio.mp3',
        ordinal: '2',
        playlist: 'updated',
        title: 'Updated Doc'
      };

      mockSend.mockResolvedValueOnce({
        Attributes: {
          content: 'Updated content',
          hero_img: 'new-image.jpg',
          media_item: 'new-audio.mp3',
          ordinal: '2',
          playlist: 'updated',
          title: 'Updated Doc'
        }
      });

      const result = await repository.updateDocument(updatedDocument);

      expect(result.user_id).toBe('user1');
      expect(result.document_id).toBe('doc1');
      expect(mockSend).toHaveBeenCalledWith(expect.any(UpdateCommand));
    });
  });

  describe('deleteDocument', () => {
    it('should delete a document', async () => {
      mockSend.mockResolvedValueOnce({});

      await repository.deleteDocument('user1', 'doc1');

      expect(mockSend).toHaveBeenCalledWith(expect.any(DeleteCommand));
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

      mockSend.mockResolvedValueOnce({ Items: [mockConfig] });

      const result = await repository.getConfig();

      expect(result).toEqual(mockConfig);
      expect(mockSend).toHaveBeenCalledWith(expect.any(QueryCommand));
    });

    it('should throw error if config not found', async () => {
      mockSend.mockResolvedValueOnce({ Items: [] });

      await expect(repository.getConfig()).rejects.toThrow('Site configuration not found');
    });
  });

  describe('backupDocument', () => {
    it('should backup a document', async () => {
      const document: ContentDocument = {
        user_id: 'user1',
        document_id: 'doc1',
        content: 'Content to backup',
        hero_img: '',
        media_item: '',
        ordinal: '1',
        playlist: 'test',
        title: 'Backup Doc'
      };

      mockSend.mockResolvedValueOnce({});

      await repository.backupDocument(document);

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith(expect.any(PutCommand));
    });
  });
});
