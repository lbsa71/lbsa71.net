import { buildIndex, JSONFileIndex } from '../jsonFileIndex';
import { ContentDocument } from '@/lib/getSite';

describe('jsonFileIndex', () => {
  describe('buildIndex', () => {
    it('should build index from documents', () => {
      const documents: ContentDocument[] = [
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
        },
        {
          user_id: 'user2',
          document_id: 'doc3',
          content: 'Content 3',
          hero_img: '',
          media_item: '',
          ordinal: '1',
          playlist: 'test',
          title: 'Doc 3'
        }
      ];

      const index = buildIndex(documents);

      expect(index.has('user1')).toBe(true);
      expect(index.has('user2')).toBe(true);
      expect(index.get('user1')?.size).toBe(2);
      expect(index.get('user2')?.size).toBe(1);
    });

    it('should handle empty documents array', () => {
      const index = buildIndex([]);

      expect(index.size).toBe(0);
    });

    it('should index documents by user_id and document_id', () => {
      const documents: ContentDocument[] = [
        {
          user_id: 'user1',
          document_id: 'doc1',
          content: 'Content 1',
          hero_img: '',
          media_item: '',
          ordinal: '1',
          playlist: 'test',
          title: 'Doc 1'
        }
      ];

      const index = buildIndex(documents);

      const doc = index.get('user1')?.get('doc1');
      expect(doc).toEqual(documents[0]);
    });
  });

  describe('JSONFileIndex', () => {
    it('should get document by user_id and document_id', () => {
      const documents: ContentDocument[] = [
        {
          user_id: 'user1',
          document_id: 'doc1',
          content: 'Test',
          hero_img: '',
          media_item: '',
          ordinal: '1',
          playlist: 'test',
          title: 'Test'
        }
      ];

      const index = new JSONFileIndex(documents);
      const doc = index.getDocument('user1', 'doc1');

      expect(doc).toEqual(documents[0]);
    });

    it('should return null if document not found', () => {
      const index = new JSONFileIndex([]);
      const doc = index.getDocument('user1', 'nonexistent');

      expect(doc).toBeNull();
    });

    it('should list documents by user_id', () => {
      const documents: ContentDocument[] = [
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
        },
        {
          user_id: 'user2',
          document_id: 'doc3',
          content: 'Content 3',
          hero_img: '',
          media_item: '',
          ordinal: '1',
          playlist: 'test',
          title: 'Doc 3'
        }
      ];

      const index = new JSONFileIndex(documents);
      const docs = index.listDocuments('user1');

      expect(docs).toHaveLength(2);
      expect(docs[0].document_id).toBe('doc1');
      expect(docs[1].document_id).toBe('doc2');
    });

    it('should return empty array if user has no documents', () => {
      const index = new JSONFileIndex([]);
      const docs = index.listDocuments('nonexistent');

      expect(docs).toEqual([]);
    });

    it('should add document to index', () => {
      const index = new JSONFileIndex([]);

      const newDoc: ContentDocument = {
        user_id: 'user1',
        document_id: 'doc1',
        content: 'New',
        hero_img: '',
        media_item: '',
        ordinal: '1',
        playlist: 'test',
        title: 'New'
      };

      index.addDocument(newDoc);

      const retrieved = index.getDocument('user1', 'doc1');
      expect(retrieved).toEqual(newDoc);
    });

    it('should update document in index', () => {
      const doc: ContentDocument = {
        user_id: 'user1',
        document_id: 'doc1',
        content: 'Original',
        hero_img: '',
        media_item: '',
        ordinal: '1',
        playlist: 'test',
        title: 'Original'
      };

      const index = new JSONFileIndex([doc]);

      const updated = { ...doc, content: 'Updated' };
      index.updateDocument(updated);

      const retrieved = index.getDocument('user1', 'doc1');
      expect(retrieved?.content).toBe('Updated');
    });

    it('should delete document from index', () => {
      const doc: ContentDocument = {
        user_id: 'user1',
        document_id: 'doc1',
        content: 'Test',
        hero_img: '',
        media_item: '',
        ordinal: '1',
        playlist: 'test',
        title: 'Test'
      };

      const index = new JSONFileIndex([doc]);

      index.deleteDocument('user1', 'doc1');

      const retrieved = index.getDocument('user1', 'doc1');
      expect(retrieved).toBeNull();
    });

    it('should get all documents', () => {
      const documents: ContentDocument[] = [
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
          user_id: 'user2',
          document_id: 'doc2',
          content: 'Content 2',
          hero_img: '',
          media_item: '',
          ordinal: '1',
          playlist: 'test',
          title: 'Doc 2'
        }
      ];

      const index = new JSONFileIndex(documents);
      const all = index.getAllDocuments();

      expect(all).toHaveLength(2);
    });
  });
});
