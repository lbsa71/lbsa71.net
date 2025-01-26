export type HeaderLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type Position = {
  line: number;
  column: number;
  offset: number;
};

export type BlockNodeType =
  | 'document'
  | 'paragraph'
  | `header${HeaderLevel}`
  | 'blockquote'
  | 'codeBlock'
  | 'horizontalRule';

export type InlineNodeType =
  | 'text'
  | 'bold'
  | 'italic'
  | 'code'
  | 'link'
  | 'image'
  | 'citation';

export type NodeType = BlockNodeType | InlineNodeType;

export interface NodeMetadata {
  level?: HeaderLevel;
  href?: string;
  title?: string;
  src?: string;
  alt?: string;
  cite?: string;
  language?: string;
}

export interface BaseNode {
  type: NodeType;
  content: string;
  raw: string;
  position: Position;
  metadata?: NodeMetadata;
}

export interface BlockNode extends BaseNode {
  type: BlockNodeType;
  children: (BlockNode | InlineNode)[];
}

export interface InlineNode extends BaseNode {
  type: InlineNodeType;
}

export type Node = BlockNode | InlineNode;

export type Visitor = (type: NodeType) => void;

export interface ParserOptions {
  visitor?: Visitor;
} 