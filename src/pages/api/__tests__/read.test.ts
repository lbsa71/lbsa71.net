import { createMocks } from 'node-mocks-http';
import readEndpoint, { getDocument } from '../read';
import { dynamoDb } from '@/lib/dynamodb';
import { localDocument } from '../localDocuments';

// Mock dependencies
jest.mock('@/lib/dynamodb', () => ({
    dynamoDb: {
        send: jest.fn()
    },
    GetCommand: jest.fn()
}));

describe('Read API Endpoint', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Query Validation', () => {
        it('should return 400 when user_id is missing', async () => {
            const { req, res } = createMocks({
                method: 'GET',
                query: {
                    document_id: 'doc123'
                }
            });

            await readEndpoint(req, res);

            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'Invalid query'
            });
        });

        it('should return 400 when document_id is missing', async () => {
            const { req, res } = createMocks({
                method: 'GET',
                query: {
                    user_id: 'user123'
                }
            });

            await readEndpoint(req, res);

            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'Invalid query'
            });
        });

        it('should return 400 when query parameters are arrays', async () => {
            const { req, res } = createMocks({
                method: 'GET',
                query: {
                    user_id: ['user123'],
                    document_id: ['doc123']
                }
            });

            await readEndpoint(req, res);

            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'Invalid query'
            });
        });
    });

    describe('Document Retrieval', () => {
        it('should return local document when document_id is "local"', async () => {
            const { req, res } = createMocks({
                method: 'GET',
                query: {
                    user_id: 'user123',
                    document_id: 'local'
                }
            });

            await readEndpoint(req, res);

            expect(res._getStatusCode()).toBe(200);
            expect(JSON.parse(res._getData())).toEqual(localDocument);
            expect(dynamoDb.send).not.toHaveBeenCalled();
        });

        it('should retrieve document from DynamoDB', async () => {
            const mockDocument = {
                user_id: 'user123',
                document_id: 'doc123',
                content: 'Test content'
            };
            (dynamoDb.send as jest.Mock).mockResolvedValueOnce({
                Item: mockDocument
            });

            const { req, res } = createMocks({
                method: 'GET',
                query: {
                    user_id: 'user123',
                    document_id: 'doc123'
                }
            });

            await readEndpoint(req, res);

            expect(res._getStatusCode()).toBe(200);
            expect(JSON.parse(res._getData())).toEqual(mockDocument);
        });

        it('should return 404 when document is not found', async () => {
            (dynamoDb.send as jest.Mock).mockResolvedValueOnce({
                Item: undefined
            });

            const { req, res } = createMocks({
                method: 'GET',
                query: {
                    user_id: 'user123',
                    document_id: 'nonexistent'
                }
            });

            await readEndpoint(req, res);

            expect(res._getStatusCode()).toBe(404);
            expect(JSON.parse(res._getData())).toEqual({
                message: 'Post not found'
            });
        });

        it('should handle database errors', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            (dynamoDb.send as jest.Mock).mockRejectedValueOnce(new Error('DB Error'));

            const { req, res } = createMocks({
                method: 'GET',
                query: {
                    user_id: 'user123',
                    document_id: 'doc123'
                }
            });

            await readEndpoint(req, res);

            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'Failed to read post'
            });

            consoleErrorSpy.mockRestore();
        });
    });

    describe('getDocument Function', () => {
        it('should return local document for document_id "local"', async () => {
            const result = await getDocument('user123', 'local');
            expect(result).toEqual(localDocument);
            expect(dynamoDb.send).not.toHaveBeenCalled();
        });

        it('should query DynamoDB for non-local documents', async () => {
            const mockDocument = {
                user_id: 'user123',
                document_id: 'doc123',
                content: 'Test content'
            };
            (dynamoDb.send as jest.Mock).mockResolvedValueOnce({
                Item: mockDocument
            });

            const result = await getDocument('user123', 'doc123');
            expect(result).toEqual(mockDocument);
            expect(dynamoDb.send).toHaveBeenCalledTimes(1);
        });

        it('should return undefined when document is not found', async () => {
            (dynamoDb.send as jest.Mock).mockResolvedValueOnce({
                Item: undefined
            });

            const result = await getDocument('user123', 'nonexistent');
            expect(result).toBeUndefined();
        });
    });
});
