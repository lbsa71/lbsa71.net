export type HeaderLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type BlockNodeType = 
  | 'document'
  | 'paragraph'
  | 'blockquote'
  | 'list'
  | 'listItem'
  | 'codeBlock'
  | `header${HeaderLevel}`;

export type InlineNodeType =
  | 'text'
  | 'bold'
  | 'italic'
  | 'link'
  | 'image'
  | 'code'
  | 'citation';

export type NodeType = BlockNodeType | InlineNodeType;

export type NodeMetadata = {
  level?: HeaderLevel;
  listType?: 'ordered' | 'unordered';
  language?: string;
  url?: string;
  alt?: string;
  title?: string;
};

export type Position = {
  line: number;
  column: number;
};

export type Node = {
  type: NodeType;
  content: string;
  raw: string;
  position?: Position;
  metadata?: NodeMetadata;
};

export type BlockNode = Node & {
  type: BlockNodeType;
  children: (BlockNode | InlineNode)[];
};

export type InlineNode = Node & {
  type: InlineNodeType;
};

export type Visitor = (node: Node) => void;

export type ParserOptions = {
  visitor?: Visitor;
}; 