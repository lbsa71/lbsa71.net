export type NodeType = 'text' | 'header' | 'paragraph' | 'link' | 'track_info' | 'image';

export type BaseNode = {
  type: NodeType;
};

export type TextNode = BaseNode & {
  type: 'text';
  value: string;
};

export type HeaderNode = BaseNode & {
  type: 'header';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: InlineNode[];
};

export type ParagraphNode = BaseNode & {
  type: 'paragraph';
  children: InlineNode[];
  position?: number;
  hasTrack?: boolean;
};

export type LinkNode = BaseNode & {
  type: 'link';
  url: string;
  children: TextNode[];
};

export type ImageNode = BaseNode & {
  type: 'image';
  src: string;
  alt: string;
  position?: number;
};

export type TrackInfoNode = BaseNode & {
  type: 'track_info';
  title: string;
  artist: string;
  album?: string;
  position: number;
  images?: ImageNode[];
};

export type Node = TextNode | HeaderNode | ParagraphNode | LinkNode | TrackInfoNode | ImageNode;
export type InlineNode = TextNode | LinkNode;

export type ParsedDocument = {
  nodes: Node[];
  tracks: TrackInfoNode[];
};