import { withAuth } from '../withAuth';
import { fetchSiteByUserId } from '@/lib/dynamodb';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { jwtDecode } from 'jwt-decode';

// Mock dependencies
jest.mock('jwt-decode');
jest.mock('@/lib/dynamodb');

const mockedJwtDecode = jwtDecode as jest.MockedFunction<typeof jwtDecode>;
const mockedFetchSiteByUserId = fetchSiteByUserId as jest.MockedFunction<typeof fetchSiteByUserId>;

describe('withAuth Middleware', () => {
    let mockReq: Partial<VercelRequest> & { headers: { [key: string]: string | string[] | undefined } };
    let mockRes: Partial<VercelResponse>;
    let mockHandler: jest.Mock;

    beforeEach(() => {
        mockReq = {
            headers: {},
            method: 'GET'
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        mockHandler = jest.fn();
    });

    describe('Authorization Header Validation', () => {
        it('should return 401 when no authorization header is present', async () => {
            const handler = withAuth(mockHandler);
            await handler(mockReq as VercelRequest, mockRes as VercelResponse);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
            expect(mockHandler).not.toHaveBeenCalled();
        });

        it('should decode token and attach user to request when valid auth header is present', async () => {
            const mockUser = {
                id: 'user123',
                name: 'Test User',
                email: 'test@example.com',
                sub: 'auth0|123'
            };
            mockReq.headers.authorization = 'Bearer valid-token';
            mockedJwtDecode.mockReturnValue(mockUser);

            const handler = withAuth(mockHandler);
            await handler(mockReq as VercelRequest, mockRes as VercelResponse);

            expect(mockedJwtDecode).toHaveBeenCalledWith('valid-token');
            expect(mockHandler).toHaveBeenCalled();
            expect((mockReq as any).user).toEqual(mockUser);
        });
    });

    describe('Site Access Validation', () => {
        const mockUser = {
            id: 'user123',
            name: 'Test User',
            email: 'test@example.com',
            sub: 'auth0|123'
        };

        beforeEach(() => {
            mockReq.headers.authorization = 'Bearer valid-token';
            mockedJwtDecode.mockReturnValue(mockUser);
        });

        it('should validate site access for POST requests', async () => {
            mockReq.method = 'POST';
            mockReq.body = { user_id: 'site123' };

            const mockSite = {
                admin_user_id: mockUser.sub,
                user_id: 'site123'
            };
            mockedFetchSiteByUserId.mockResolvedValue(mockSite as any);

            const handler = withAuth(mockHandler);
            await handler(mockReq as VercelRequest, mockRes as VercelResponse);

            expect(mockedFetchSiteByUserId).toHaveBeenCalledWith('site123');
            expect(mockHandler).toHaveBeenCalled();
            expect((mockReq as any).site).toEqual(mockSite);
        });

        it('should return 403 when user is not site admin', async () => {
            mockReq.method = 'POST';
            mockReq.body = { user_id: 'site123' };

            const mockSite = {
                admin_user_id: 'different-user',
                user_id: 'site123'
            };
            mockedFetchSiteByUserId.mockResolvedValue(mockSite as any);

            const handler = withAuth(mockHandler);
            await handler(mockReq as VercelRequest, mockRes as VercelResponse);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Forbidden: You do not have access to modify this resource'
            });
            expect(mockHandler).not.toHaveBeenCalled();
        });

        it('should return 400 when user_id is missing in body for POST requests', async () => {
            mockReq.method = 'POST';
            mockReq.body = {};

            const handler = withAuth(mockHandler);
            await handler(mockReq as VercelRequest, mockRes as VercelResponse);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing user_id' });
            expect(mockHandler).not.toHaveBeenCalled();
        });

        it('should handle site fetch errors', async () => {
            mockReq.method = 'POST';
            mockReq.body = { user_id: 'site123' };

            mockedFetchSiteByUserId.mockRejectedValue(new Error('Database error'));

            const handler = withAuth(mockHandler);
            await handler(mockReq as VercelRequest, mockRes as VercelResponse);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Failed to verify authorization'
            });
            expect(mockHandler).not.toHaveBeenCalled();
        });
    });

    describe('HTTP Method Handling', () => {
        const mockUser = {
            id: 'user123',
            name: 'Test User',
            email: 'test@example.com',
            sub: 'auth0|123'
        };

        beforeEach(() => {
            mockReq.headers.authorization = 'Bearer valid-token';
            mockedJwtDecode.mockReturnValue(mockUser);
        });

        it('should skip site validation for GET requests', async () => {
            mockReq.method = 'GET';
            mockedFetchSiteByUserId.mockClear();

            const handler = withAuth(mockHandler);
            await handler(mockReq as VercelRequest, mockRes as VercelResponse);

            expect(mockedFetchSiteByUserId).not.toHaveBeenCalled();
            expect(mockHandler).toHaveBeenCalled();
        });

        it.each(['POST', 'PUT', 'DELETE', 'PATCH'])(
            'should require site validation for %s requests',
            async (method) => {
                mockReq.method = method;
                mockReq.body = { user_id: 'site123' };

                const mockSite = {
                    admin_user_id: mockUser.sub,
                    user_id: 'site123'
                };
                mockedFetchSiteByUserId.mockResolvedValue(mockSite as any);

                const handler = withAuth(mockHandler);
                await handler(mockReq as VercelRequest, mockRes as VercelResponse);

                expect(mockedFetchSiteByUserId).toHaveBeenCalledWith('site123');
                expect(mockHandler).toHaveBeenCalled();
            }
        );
    });
});
