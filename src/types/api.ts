import { ContentDocument } from './core';

export type ApiResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
};

export type CreateDocumentRequest = {
  user_id: string;
  document_id?: string;
  content: string;
};

export type UpdateDocumentRequest = {
  user_id: string;
  admin_user_id: string;
  document_id: string;
  content: string;
  hero_img?: string;
  media_item?: string;
  playlist?: string;
  ordinal?: string;
};

export type DeleteDocumentRequest = {
  user_id: string;
  document_id: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  sub: string;
}; 