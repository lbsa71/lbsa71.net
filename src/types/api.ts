import { ContentDocument } from './core';

export type ApiResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
};

export type CreateDocumentRequest = {
  user_id: string;
  documentId?: string;
  content: string;
};

export type UpdateDocumentRequest = {
  user_id: string;
  adminUserId: string;
  documentId: string;
  content: string;
  heroImage?: string;
  mediaItem?: string;
  playlist?: string;
  ordinal?: string;
};

export type DeleteDocumentRequest = {
  user_id: string;
  documentId: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  sub: string;
}; 