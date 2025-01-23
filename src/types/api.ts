import { ContentDocument } from './core';

export type ApiResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
};

export type CreateDocumentRequest = {
  userId: string;
  documentId?: string;
  content: string;
};

export type UpdateDocumentRequest = {
  userId: string;
  adminUserId: string;
  documentId: string;
  content: string;
  heroImage?: string;
  mediaItem?: string;
  playlist?: string;
  ordinal?: string;
};

export type DeleteDocumentRequest = {
  userId: string;
  documentId: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  sub: string;
}; 