import { createMocks } from 'node-mocks-http';
import createEndpoint from '../create';
import { dynamoDb } from '@/lib/dynamodb';
import { withAuth } from '../lib/withAuth';

// Mock dependencies
jest.mock('@/lib/dynamodb', () => ({
    dynamoDb: {
        send: jest.fn()
    },
    PutCommand: jest.fn()
}));

jest.mock('../lib/withAuth', () => ({
    withAuth: jest.fn((handler) => handler)
}));

describe('Create API Endpoint', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Input Validation', () => {
        it('should return 400 when user_id is missing', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    content: 'Test content'
                }
            });

            await createEndpoint(req, res);

            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'Missing required fields'
            });
        });

        it('should return 400 when content is missing', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    user_id: 'user123'
                }
            });

            await createEndpoint(req, res);

            expect(res._getStatusCode()).toBe(400);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'Missing required fields'
            });
        });
    });

    describe('Document Creation', () => {
        it('should create document with provided document_id', async () => {
            const mockData = { success: true };
            (dynamoDb.send as jest.Mock).mockResolvedValueOnce(mockData);

            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    user_id: 'user123',
                    document_id: 'doc123',
                    content: 'Test content'
                }
            });

            await createEndpoint(req, res);

            expect(res._getStatusCode()).toBe(200);
            expect(JSON.parse(res._getData())).toEqual({
                message: 'Post created',
                document_id: 'doc123',
                data: mockData
            });
        });

        it('should generate document_id if not provided', async () => {
            const mockData = { success: true };
            (dynamoDb.send as jest.Mock).mockResolvedValueOnce(mockData);

            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    user_id: 'user123',
                    content: 'Test content'
                }
            });

            await createEndpoint(req, res);

            expect(res._getStatusCode()).toBe(200);
            const response = JSON.parse(res._getData());
            expect(response.message).toBe('Post created');
            expect(response.document_id).toBeDefined();
            expect(typeof response.document_id).toBe('string');
        });

        it('should handle database errors', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            (dynamoDb.send as jest.Mock).mockRejectedValueOnce(new Error('DB Error'));

            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    user_id: 'user123',
                    document_id: 'doc123',
                    content: 'Test content'
                }
            });

            await createEndpoint(req, res);

            expect(res._getStatusCode()).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({
                error: 'Failed to create post'
            });

            consoleErrorSpy.mockRestore();
        });
    });

    describe('CORS Headers', () => {
        it('should set CORS headers', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    user_id: 'user123',
                    document_id: 'doc123',
                    content: 'Test content'
                }
            });

            await createEndpoint(req, res);

            expect(res.getHeader('Access-Control-Allow-Origin')).toBe('*');
            expect(res.getHeader('Access-Control-Allow-Methods')).toBe(
                'GET, POST, PUT, DELETE, OPTIONS'
            );
            expect(res.getHeader('Access-Control-Allow-Headers')).toBe(
                'Content-Type, Authorization'
            );
        });

        it('should handle OPTIONS request', async () => {
            const { req, res } = createMocks({
                method: 'OPTIONS',
                body: {
                    user_id: 'user123',
                    content: 'Test content'
                }
            });

            await createEndpoint(req, res);

            expect(res._getStatusCode()).toBe(200);
            expect(res._getData()).toBe('');
        });
    });
});
