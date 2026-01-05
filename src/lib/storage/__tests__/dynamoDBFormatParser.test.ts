import { parseDynamoDBExportLine, serializeToDynamoDBFormat } from '../dynamoDBFormatParser';

describe('dynamoDBFormatParser', () => {
  describe('parseDynamoDBExportLine', () => {
    it('should parse string values', () => {
      const line = '{"Item":{"user_id":{"S":"test_user"},"document_id":{"S":"doc123"}}}';
      const result = parseDynamoDBExportLine(line);

      expect(result).toEqual({
        user_id: 'test_user',
        document_id: 'doc123'
      });
    });

    it('should parse multiple field types', () => {
      const line = '{"Item":{"user_id":{"S":"lbsa71"},"document_id":{"S":"under_construction"},"content":{"S":"#Test Content"},"ordinal":{"S":"0"},"media_item":{"S":"0"},"playlist":{"S":"0"},"hero_img":{"S":"0"}}}';
      const result = parseDynamoDBExportLine(line);

      expect(result).toEqual({
        user_id: 'lbsa71',
        document_id: 'under_construction',
        content: '#Test Content',
        ordinal: '0',
        media_item: '0',
        playlist: '0',
        hero_img: '0'
      });
    });

    it('should handle NULL values', () => {
      const line = '{"Item":{"user_id":{"S":"test"},"playlist":{"NULL":true},"hero_img":{"NULL":true}}}';
      const result = parseDynamoDBExportLine(line);

      expect(result).toEqual({
        user_id: 'test',
        playlist: null,
        hero_img: null
      });
    });

    it('should handle number values', () => {
      const line = '{"Item":{"count":{"N":"42"}}}';
      const result = parseDynamoDBExportLine(line);

      expect(result).toEqual({
        count: '42'
      });
    });

    it('should handle boolean values', () => {
      const line = '{"Item":{"active":{"BOOL":true},"inactive":{"BOOL":false}}}';
      const result = parseDynamoDBExportLine(line);

      expect(result).toEqual({
        active: true,
        inactive: false
      });
    });

    it('should handle list values', () => {
      const line = '{"Item":{"playlists":{"L":[{"S":"item1"},{"S":"item2"}]}}}';
      const result = parseDynamoDBExportLine(line);

      expect(result).toEqual({
        playlists: ['item1', 'item2']
      });
    });

    it('should handle map values', () => {
      const line = '{"Item":{"config":{"M":{"theme":{"S":"dark"},"active":{"BOOL":true}}}}}';
      const result = parseDynamoDBExportLine(line);

      expect(result).toEqual({
        config: {
          theme: 'dark',
          active: true
        }
      });
    });

    it('should handle complex nested structures', () => {
      const line = '{"Item":{"sites":{"L":[{"M":{"user_id":{"S":"local"},"urls":{"L":[]}}}]}}}';
      const result = parseDynamoDBExportLine(line);

      expect(result).toEqual({
        sites: [{
          user_id: 'local',
          urls: []
        }]
      });
    });
  });

  describe('serializeToDynamoDBFormat', () => {
    it('should serialize string values', () => {
      const obj = { user_id: 'test_user', document_id: 'doc123' };
      const result = serializeToDynamoDBFormat(obj);

      expect(result).toEqual('{"Item":{"user_id":{"S":"test_user"},"document_id":{"S":"doc123"}}}');
    });

    it('should serialize null values', () => {
      const obj = { user_id: 'test', playlist: null, hero_img: null };
      const result = serializeToDynamoDBFormat(obj);

      expect(result).toEqual('{"Item":{"user_id":{"S":"test"},"playlist":{"NULL":true},"hero_img":{"NULL":true}}}');
    });

    it('should serialize number strings', () => {
      const obj = { count: '42', ordinal: '1' };
      const result = serializeToDynamoDBFormat(obj);

      // Numbers as strings should remain as strings
      expect(result).toEqual('{"Item":{"count":{"S":"42"},"ordinal":{"S":"1"}}}');
    });

    it('should serialize boolean values', () => {
      const obj = { active: true, inactive: false };
      const result = serializeToDynamoDBFormat(obj);

      expect(result).toEqual('{"Item":{"active":{"BOOL":true},"inactive":{"BOOL":false}}}');
    });

    it('should serialize arrays', () => {
      const obj = { playlists: ['item1', 'item2'] };
      const result = serializeToDynamoDBFormat(obj);

      expect(result).toEqual('{"Item":{"playlists":{"L":[{"S":"item1"},{"S":"item2"}]}}}');
    });

    it('should serialize nested objects', () => {
      const obj = { config: { theme: 'dark', active: true } };
      const result = serializeToDynamoDBFormat(obj);

      expect(result).toEqual('{"Item":{"config":{"M":{"theme":{"S":"dark"},"active":{"BOOL":true}}}}}');
    });

    it('should handle complex ContentDocument', () => {
      const doc = {
        user_id: 'lbsa71',
        document_id: 'test',
        content: '#Hello',
        hero_img: 'image.jpg',
        media_item: 'audio.mp3',
        ordinal: '1',
        playlist: 'test',
        title: 'Test Doc'
      };
      const result = serializeToDynamoDBFormat(doc);

      // Parse it back to verify round-trip
      const parsed = parseDynamoDBExportLine(result);
      expect(parsed).toEqual(doc);
    });
  });
});
