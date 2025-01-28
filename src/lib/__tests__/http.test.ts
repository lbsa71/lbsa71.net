import axios from 'axios';
import { createAuthenticatedOperations } from '../http';
import { ContentDocument } from '../getSite';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HTTP Client', () => {
    const mockToken = 'test-token';
    const mockDocument: ContentDocument = {
        user_id: 'user123',
        document_id: 'doc123',
        content: 'Test content',
        title: 'Test Document',
        hero_img: 'hero.jpg',
        media_item: 'media1',
        ordinal: '1',
        playlist: 'main'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Authentication', () => {
        it('should include auth token in headers when provided', async () => {
            const operations = createAuthenticatedOperations(mockToken);
            mockedAxios.post.mockResolvedValueOnce({ data: mockDocument });

            await operations.createDocument(mockDocument);

            expect(mockedAxios.post).toHaveBeenCalledWith(
                '/api/create',
                mockDocument,
                expect.objectContaining({
                    headers: { Authorization: `Bearer ${mockToken}` }
                })
            );
        });

        it('should not include auth header when token is null', async () => {
            const operations = createAuthenticatedOperations(null);
            mockedAxios.post.mockResolvedValueOnce({ data: mockDocument });

            await operations.createDocument(mockDocument);

            expect(mockedAxios.post).toHaveBeenCalledWith(
                '/api/create',
                mockDocument,
                expect.objectContaining({
                    headers: {}
                })
            );
        });
    });

    describe('CRUD Operations', () => {
        const operations = createAuthenticatedOperations(mockToken);

        describe('createDocument', () => {
            it('should POST to /api/create', async () => {
                mockedAxios.post.mockResolvedValueOnce({ data: mockDocument });

                const result = await operations.createDocument(mockDocument);

                expect(mockedAxios.post).toHaveBeenCalledWith(
                    '/api/create',
                    mockDocument,
                    expect.any(Object)
                );
                expect(result).toEqual(mockDocument);
            });
        });

        describe('updateDocument', () => {
            it('should POST to /api/update', async () => {
                mockedAxios.post.mockResolvedValueOnce({ data: mockDocument });

                const result = await operations.updateDocument(mockDocument);

                expect(mockedAxios.post).toHaveBeenCalledWith(
                    '/api/update',
                    mockDocument,
                    expect.any(Object)
                );
                expect(result).toEqual(mockDocument);
            });
        });

        describe('deleteDocument', () => {
            it('should DELETE with correct payload', async () => {
                mockedAxios.delete.mockResolvedValueOnce({ data: {} });

                await operations.deleteDocument('user123', 'doc123');

                expect(mockedAxios.delete).toHaveBeenCalledWith(
                    '/api/delete',
                    expect.objectContaining({
                        data: { user_id: 'user123', document_id: 'doc123' }
                    })
                );
            });
        });

        describe('listDocuments', () => {
            it('should GET with correct query params', async () => {
                const mockDocuments = [mockDocument];
                mockedAxios.get.mockResolvedValueOnce({ data: mockDocuments });

                const result = await operations.listDocuments('user123');

                expect(mockedAxios.get).toHaveBeenCalledWith(
                    '/api/list',
                    expect.objectContaining({
                        params: { user_id: 'user123' }
                    })
                );
                expect(result).toEqual(mockDocuments);
            });
        });

        describe('readDocument', () => {
            it('should GET with correct query params', async () => {
                mockedAxios.get.mockResolvedValueOnce({ data: mockDocument });

                const result = await operations.readDocument('user123', 'doc123');

                expect(mockedAxios.get).toHaveBeenCalledWith(
                    '/api/read',
                    expect.objectContaining({
                        params: { user_id: 'user123', document_id: 'doc123' }
                    })
                );
                expect(result).toEqual(mockDocument);
            });
        });
    });

    describe('Error Handling', () => {
        const operations = createAuthenticatedOperations(mockToken);

        it('should propagate axios errors', async () => {
            const error = new Error('Network error');
            mockedAxios.post.mockRejectedValueOnce(error);

            await expect(operations.createDocument(mockDocument))
                .rejects
                .toThrow('Network error');
        });

        it('should handle API errors with status codes', async () => {
            const apiError = {
                response: {
                    status: 400,
                    data: { message: 'Bad Request' }
                }
            };
            mockedAxios.post.mockRejectedValueOnce(apiError);

            await expect(operations.createDocument(mockDocument))
                .rejects
                .toEqual(apiError);
        });
    });
});
