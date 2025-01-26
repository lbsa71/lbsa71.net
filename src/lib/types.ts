export type NodeType = 'text' | 'header' | 'paragraph' | 'link' | 'track_info' | 'image' | 'blockquote' | 'codeBlock' | 'bold' | 'italic' | 'list' | 'listItem';

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

export type BlockquoteNode = BaseNode & {
  type: 'blockquote';
  children: InlineNode[];
};

export type CodeBlockNode = BaseNode & {
  type: 'codeBlock';
  value: string;
  language?: string;
};

export type BoldNode = BaseNode & {
  type: 'bold';
  children: InlineNode[];
};

export type ItalicNode = BaseNode & {
  type: 'italic';
  children: InlineNode[];
};

export type ListNode = BaseNode & {
  type: 'list';
  ordered: boolean;
  children: ListItemNode[];
};

export type ListItemNode = BaseNode & {
  type: 'listItem';
  children: (ParagraphNode | ListNode)[];
};

export type Node = TextNode | HeaderNode | ParagraphNode | LinkNode | TrackInfoNode | ImageNode | BlockquoteNode | CodeBlockNode | BoldNode | ItalicNode | ListNode | ListItemNode;
export type InlineNode = TextNode | LinkNode | BoldNode | ItalicNode;

export type ParsedDocument = {
  nodes: Node[];
  tracks: TrackInfoNode[];
};