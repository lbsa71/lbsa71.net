type MediaItem = {
  url: string;
  type: 'image' | 'audio' | 'video';
  alt?: string;
  title?: string;
};

type BaseNode = {
  id: string;
  type: string;
  position?: number;
};

type TextNode = BaseNode & {
  type: 'text';
  content: string;
};

type HeaderNode = BaseNode & {
  type: 'header';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  content: string;
};

type ParagraphNode = BaseNode & {
  type: 'paragraph';
  content: string;
  hasTrack?: boolean;
};

type TrackNode = BaseNode & {
  type: 'track';
  title: string;
  artist?: string;
  album?: string;
  position: number;
  media?: MediaItem[];
};

type DocumentNode = TextNode | HeaderNode | ParagraphNode | TrackNode;

type Site = {
  title: string;
  userId: string;
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
};

type ContentDocument = {
  id: string;
  userId: string;
  title: string;
  content: string;
  heroImage?: string;
  mediaItem?: string;
  playlist?: string;
  ordinal?: string;
  nodes: DocumentNode[];
  createdAt: string;
  updatedAt: string;
};

type ApiResponse<T> = {
  data: T;
  error?: string;
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
  ApiResponse
}; 