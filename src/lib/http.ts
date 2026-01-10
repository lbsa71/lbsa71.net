import axios from 'axios';
import { ContentDocument } from './getSite';
import { getApiPath } from './paths';

const BASE_URL = getApiPath('/api');

// Factory functions that create authenticated operations
export const createAuthenticatedOperations = (token: string | null) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    return {
        createDocument: async (document: ContentDocument): Promise<ContentDocument> => {
            const { data } = await axios.post<ContentDocument>(`${BASE_URL}/create`, document, { headers });
            return data;
        },

        updateDocument: async (document: ContentDocument): Promise<ContentDocument> => {
            const { data } = await axios.post<ContentDocument>(`${BASE_URL}/update`, document, { headers });
            return data;
        },

        deleteDocument: async (userId: string, documentId: string): Promise<void> => {
            await axios.delete(`${BASE_URL}/delete`, {
                headers,
                data: { user_id: userId, document_id: documentId },
            });
        },

        listDocuments: async (userId: string): Promise<ContentDocument[]> => {
            const { data } = await axios.get<ContentDocument[]>(`${BASE_URL}/list`, {
                headers,
                params: { user_id: userId },
            });
            return data;
        },

        readDocument: async (userId: string, documentId: string): Promise<ContentDocument> => {
            const { data } = await axios.get<ContentDocument>(`${BASE_URL}/read`, {
                headers,
                params: { user_id: userId, document_id: documentId },
            });
            return data;
        },
    };
};

// Type for the operations object
export type AuthenticatedOperations = ReturnType<typeof createAuthenticatedOperations>;
