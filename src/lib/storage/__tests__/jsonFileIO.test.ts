import * as fs from 'fs';
import * as path from 'path';
import { readJSONFile, writeJSONFile } from '../jsonFileIO';

// Mock fs module
jest.mock('fs');

const mockedFs = fs as jest.Mocked<typeof fs>;

describe('jsonFileIO', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('readJSONFile', () => {
    it('should read and parse newline-delimited JSON file', () => {
      const fileContent = `{"Item":{"user_id":{"S":"user1"}}}
{"Item":{"user_id":{"S":"user2"}}}
{"Item":{"user_id":{"S":"user3"}}}`;

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(fileContent);

      const result = readJSONFile('/path/to/file.json');

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual('{"Item":{"user_id":{"S":"user1"}}}');
      expect(result[1]).toEqual('{"Item":{"user_id":{"S":"user2"}}}');
      expect(result[2]).toEqual('{"Item":{"user_id":{"S":"user3"}}}');
    });

    it('should handle empty lines in file', () => {
      const fileContent = `{"Item":{"user_id":{"S":"user1"}}}

{"Item":{"user_id":{"S":"user2"}}}

`;

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(fileContent);

      const result = readJSONFile('/path/to/file.json');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual('{"Item":{"user_id":{"S":"user1"}}}');
      expect(result[1]).toEqual('{"Item":{"user_id":{"S":"user2"}}}');
    });

    it('should return empty array if file does not exist', () => {
      mockedFs.existsSync.mockReturnValue(false);

      const result = readJSONFile('/path/to/nonexistent.json');

      expect(result).toEqual([]);
    });

    it('should return empty array if file is empty', () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue('');

      const result = readJSONFile('/path/to/empty.json');

      expect(result).toEqual([]);
    });
  });

  describe('writeJSONFile', () => {
    it('should write lines with newline delimiters', () => {
      const lines = [
        '{"Item":{"user_id":{"S":"user1"}}}',
        '{"Item":{"user_id":{"S":"user2"}}}',
        '{"Item":{"user_id":{"S":"user3"}}}'
      ];

      mockedFs.writeFileSync.mockImplementation(() => {});
      mockedFs.mkdirSync.mockImplementation(() => undefined);

      writeJSONFile('/path/to/file.json', lines);

      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        '/path/to/file.json',
        lines.join('\n'),
        'utf-8'
      );
    });

    it('should create directory if it does not exist', () => {
      const lines = ['{"Item":{"user_id":{"S":"user1"}}}'];

      mockedFs.writeFileSync.mockImplementation(() => {});
      mockedFs.existsSync.mockReturnValue(false);
      mockedFs.mkdirSync.mockImplementation(() => undefined);

      writeJSONFile('/path/to/file.json', lines);

      expect(mockedFs.mkdirSync).toHaveBeenCalledWith('/path/to', { recursive: true });
    });

    it('should not create directory if it exists', () => {
      const lines = ['{"Item":{"user_id":{"S":"user1"}}}'];

      mockedFs.writeFileSync.mockImplementation(() => {});
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.mkdirSync.mockImplementation(() => undefined);

      writeJSONFile('/path/to/file.json', lines);

      expect(mockedFs.mkdirSync).not.toHaveBeenCalled();
    });

    it('should handle empty lines array', () => {
      mockedFs.writeFileSync.mockImplementation(() => {});
      mockedFs.mkdirSync.mockImplementation(() => undefined);

      writeJSONFile('/path/to/file.json', []);

      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        '/path/to/file.json',
        '',
        'utf-8'
      );
    });
  });
});
