export type TokenType = 
  | 'header1' 
  | 'header2' 
  | 'header3' 
  | 'header4' 
  | 'header5' 
  | 'header6'
  | 'paragraph'
  | 'link'
  | 'image'
  | 'text'
  | 'horizontalRule'
  | 'citation';

export type Position = {
  line: number;
  column: number;
  offset: number;
};

export type TokenContext = {
  type: TokenType;
  content: string;
  raw: string;
  position: Position;
  parent?: Token;
};

export type Token = TokenContext & {
  children?: Token[];
};

export type ParserCallbacks = {
  onHeader?: (context: TokenContext) => void;
  onParagraph?: (context: TokenContext) => void;
  onLink?: (context: TokenContext & { href: string; title?: string }) => void;
  onImage?: (context: TokenContext & { src: string; alt?: string }) => void;
  onHorizontalRule?: (context: TokenContext) => void;
  onCitation?: (context: TokenContext & { cite: string }) => void;
  onText?: (context: TokenContext) => void;
};

export type ParserOptions = {
  callbacks: ParserCallbacks;
}; 