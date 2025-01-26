# Markdown Parser

A robust and extensible markdown parser that creates an Abstract Syntax Tree (AST) from markdown text. The parser supports a variety of markdown features and provides a visitor pattern for traversing and transforming the AST.

## Features

- **Block Elements**
  - Headers (h1-h6)
  - Blockquotes
  - Code blocks (with language support)
  - Horizontal rules
  - Paragraphs

- **Inline Elements**
  - Bold text (`**` or `__`)
  - Italic text (`*` or `_`)
  - Inline code (`` ` ``)
  - Links (`[text](url)` with optional titles)
  - Images (`![alt](src)` with support for nested brackets)
  - Citations (`[123]`)

## Installation

```bash
npm install @lbsa71/markdown-parser
```

## Basic Usage

```typescript
import { MarkdownParser } from '@lbsa71/markdown-parser';

const parser = new MarkdownParser();
const ast = parser.parse('# Hello World\n\nThis is a **bold** statement.');

console.log(JSON.stringify(ast, null, 2));
```

## AST Structure

The parser generates an AST with two main types of nodes:

### Block Nodes
- `document`: Root node containing all other nodes
- `paragraph`: Basic text container
- `header1` through `header6`: Section headers
- `blockquote`: Quoted text
- `codeBlock`: Code blocks with optional language

### Inline Nodes
- `text`: Plain text
- `bold`: Bold text
- `italic`: Italic text
- `code`: Inline code
- `link`: Hyperlinks
- `image`: Images
- `citation`: Citation references

## Visitor Pattern

The parser supports a visitor pattern for traversing and transforming the AST:

```typescript
import { MarkdownParser, NodeType } from '@lbsa71/markdown-parser';

const parser = new MarkdownParser();
const ast = parser.parse('# Title\nHello **world**');

const visited: string[] = [];
const visitor = (type: NodeType) => visited.push(type);

parser.visit(ast, visitor);
// visited = ['document', 'header1', 'text', 'paragraph', 'text', 'bold', 'text']
```

## Example

See the [examples](./examples) directory for more detailed usage examples, including:
- HTML rendering
- Custom AST transformations
- Advanced visitor pattern usage

## API Reference

### MarkdownParser

```typescript
class MarkdownParser {
  constructor(options?: ParserOptions);
  parse(input: string): BlockNode;
  visit(node: Node, visitor: Visitor): void;
}
```

### Types

```typescript
type NodeType = BlockNodeType | InlineNodeType;

interface Node {
  type: NodeType;
  content: string;
  raw: string;
  position: Position;
  metadata?: NodeMetadata;
}

type Visitor = (type: NodeType) => void;
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 