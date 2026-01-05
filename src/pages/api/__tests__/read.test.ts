import { createMocks } from 'node-mocks-http';
import readEndpoint, { getDocument } from '../read';
import { localDocument } from '../localDocuments';

// Mock repository
const mockRepository = {
    getDocument: jest.fn(),
    listDocuments: jest.fn(),
    createDocument: jest.fn(),
    updateDocument: jest.fn(),
    deleteDocument: jest.fn(),
    getConfig: jest.fn(),
    updateConfig: jest.fn(),
    backupDocument: jest.fn()
};

jest.mock('@/lib/storage/repositoryFactory', () => ({
    getRepository: jest.fn(() => mockRepository)
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
            expect(mockRepository.getDocument).not.toHaveBeenCalled();
        });

        it('should retrieve document from repository', async () => {
            const mockDocument = {
                user_id: 'user123',
                document_id: 'doc123',
                content: 'Test content',
                hero_img: '',
                media_item: '',
                ordinal: '',
                playlist: '',
                title: ''
            };
            mockRepository.getDocument.mockResolvedValueOnce(mockDocument);

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
            mockRepository.getDocument.mockResolvedValueOnce(null);

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
            mockRepository.getDocument.mockRejectedValueOnce(new Error('DB Error'));

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
            expect(mockRepository.getDocument).not.toHaveBeenCalled();
        });

        it('should query repository for non-local documents', async () => {
            const mockDocument = {
                user_id: 'user123',
                document_id: 'doc123',
                content: 'Test content',
                hero_img: '',
                media_item: '',
                ordinal: '',
                playlist: '',
                title: ''
            };
            mockRepository.getDocument.mockResolvedValueOnce(mockDocument);

            const result = await getDocument('user123', 'doc123');
            expect(result).toEqual(mockDocument);
            expect(mockRepository.getDocument).toHaveBeenCalledTimes(1);
        });

        it('should return null when document is not found', async () => {
            mockRepository.getDocument.mockResolvedValueOnce(null);

            const result = await getDocument('user123', 'nonexistent');
            expect(result).toBeNull();
        });
    });
});
