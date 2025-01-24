type MediaItem = RemoveUndefined<{
  url: string;
  type: 'image' | 'audio' | 'video';
  alt?: string;
  title?: string;
}>;

type BaseNode = RemoveUndefined<{
  id: string;
  type: string;
  position?: number;
}>;

type TextNode = RemoveUndefined<BaseNode & {
  type: 'text';
  content: string;
}>;

type HeaderNode = RemoveUndefined<BaseNode & {
  type: 'header';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  content: string;
}>;

type ParagraphNode = RemoveUndefined<BaseNode & {
  type: 'paragraph';
  content: string;
  hasTrack?: boolean;
}>;

type TrackNode = RemoveUndefined<BaseNode & {
  type: 'track';
  title: string;
  artist?: string;
  album?: string;
  position: number;
  media?: MediaItem[];
}>;

type DocumentNode = TextNode | HeaderNode | ParagraphNode | TrackNode;

type Site = RemoveUndefined<{
  title: string;
  user_id: string;
  adminUserId: string;
  urls: string[];
  playlists: string[];
  feed?: string;
  theme: string;
  mediaFolder: string;
  mediaUrl: string;
  byline: string;
  banner?: string;
  redirect?: {
    destination: string;
    permanent: boolean;
  };
}>;

type ContentDocument = RemoveUndefined<{
  document_id: string;
  user_id: string;
  title: string;
  content: string;
  heroImage?: string;
  mediaItem?: string;
  playlist?: string;
  ordinal?: string;
  nodes: DocumentNode[];
  createdAt: string;
  updatedAt: string;
}>;

type ApiResponse<T> = {
  data: T;
  error?: string;
};

type RemoveUndefined<T> = {
  [P in keyof T as T[P] extends undefined ? never : P]: T[P] extends object ? RemoveUndefined<T[P]> : T[P]
};

export type {
  MediaItem,
  BaseNode,
  TextNode,
  HeaderNode,
  ParagraphNode,
  TrackNode,
  DocumentNode,
  Site,
  ContentDocument,
  ApiResponse,
  RemoveUndefined
}; 