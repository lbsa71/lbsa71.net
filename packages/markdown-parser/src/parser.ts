import { ParserOptions, BlockNode, InlineNode, Node, NodeType, Position, Visitor, BlockNodeType, HeaderLevel } from './types';

export class MarkdownParser {
  private pos: Position;
  private currentLine = 1;

  constructor(private options: ParserOptions = {}) {
    this.pos = { line: 1, column: 1 };
  }

  private createNode(type: NodeType, content: string, raw: string, children?: (BlockNode | InlineNode)[]): Node {
    const node: Node = {
      type,
      content,
      raw,
      position: {
        line: this.currentLine,
        column: 1
      }
    };

    if (children) {
      return {
        ...node,
        type: type as BlockNodeType,
        children
      } as BlockNode;
    }

    return node;
  }

  private isBlockType(type: NodeType): type is BlockNodeType {
    return [
      'document',
      'paragraph',
      'header1',
      'header2',
      'header3',
      'header4',
      'header5',
      'header6',
      'blockquote',
      'codeBlock',
      'horizontalRule',
    ].includes(type);
  }

  private updatePosition(line: number) {
    this.pos.line = line;
  }

  private mergeTextNodes(nodes: BlockNode[]): BlockNode[] {
    return nodes;
  }

  private parseInlineElements(text: string): InlineNode[] {
    const nodes: InlineNode[] = [];
    let pos = 0;

    while (pos < text.length) {
      const char = text[pos];

      if (char === '*' || char === '_') {
        const isDouble = text[pos + 1] === char;
        const type = isDouble ? 'bold' : 'italic';
        const length = isDouble ? 2 : 1;
        const endPos = text.indexOf(char.repeat(length), pos + length);

        if (endPos !== -1) {
          const content = text.slice(pos + length, endPos);
          const children = this.parseInlineElements(content);
          const node = this.createNode(type, content, text.slice(pos, endPos + length), children);
          nodes.push(node as InlineNode);
          pos = endPos + length;
          continue;
        }
      }

      if (char === '[') {
        const endBracket = text.indexOf(']', pos);
        if (endBracket !== -1) {
          const nextChar = text[endBracket + 1];
          if (nextChar === '(') {
            const endParen = text.indexOf(')', endBracket + 2);
            if (endParen !== -1) {
              const content = text.slice(pos + 1, endBracket);
              const url = text.slice(endBracket + 2, endParen);
              const node = this.createNode('link', content, text.slice(pos, endParen + 1));
              node.metadata = { url };
              nodes.push(node as InlineNode);
              pos = endParen + 1;
              continue;
            }
          }
        }
      }

      if (char === '`') {
        const endPos = text.indexOf('`', pos + 1);
        if (endPos !== -1) {
          const content = text.slice(pos + 1, endPos);
          const node = this.createNode('code', content, text.slice(pos, endPos + 1));
          nodes.push(node as InlineNode);
          pos = endPos + 1;
          continue;
        }
      }

      // If no special character is found, treat as text
      let textEnd = pos + 1;
      while (textEnd < text.length && !'*_[`'.includes(text[textEnd])) {
        textEnd++;
      }
      const content = text.slice(pos, textEnd);
      const node = this.createNode('text', content, content);
      nodes.push(node as InlineNode);
      pos = textEnd;
    }

    return nodes;
  }

  private parseList(lines: string[], startIndex: number): [BlockNode, number] {
    const listItems: { indent: number; content: string; }[] = [];
    let currentIndex = startIndex;
    let baseIndent = -1;

    while (currentIndex < lines.length) {
      const line = lines[currentIndex];
      const listMatch = line.match(/^(\s*)[-*+]\s+(.+)$/);
      const orderedListMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
      
      if (!listMatch && !orderedListMatch) {
        if (line.trim() === '') {
          currentIndex++;
          continue;
        }
        break;
      }

      const match = listMatch || orderedListMatch;
      const [, indent, content] = match!;
      
      if (baseIndent === -1) {
        baseIndent = indent.length;
      }

      listItems.push({ indent: indent.length - baseIndent, content });
      currentIndex++;
    }

    const createListItems = (items: typeof listItems, level: number = 0): BlockNode[] => {
      const result: BlockNode[] = [];
      let i = 0;

      while (i < items.length) {
        const item = items[i];
        if (item.indent === level) {
          const children: (BlockNode | InlineNode)[] = [];
          let j = i + 1;
          
          // Parse inline elements for the current item
          children.push(...this.parseInlineElements(item.content));
          
          // Collect nested items
          while (j < items.length && items[j].indent > level) {
            j++;
          }
          
          if (j > i + 1) {
            // We have nested items
            children.push(this.createNode('list', '', '', createListItems(items.slice(i + 1, j), level + 2)) as BlockNode);
          }

          const listItemNode = this.createNode('listItem', item.content, item.content, children) as BlockNode;
          result.push(listItemNode);
          i = j;
        } else {
          i++;
        }
      }

      return result;
    };

    const listType = lines[startIndex].trim().startsWith('-') ? 'unordered' : 'ordered';
    const listNode = this.createNode('list', '', '', createListItems(listItems)) as BlockNode;
    listNode.metadata = { listType };

    return [listNode, currentIndex - 1];
  }

  private parseHeader(lines: string[], startIndex: number): [BlockNode, number] {
    const line = lines[startIndex];
    const headerMatch = line.match(/^(#{1,6})\s(.+)$/);
    if (!headerMatch) {
      throw new Error('Invalid header line');
    }

    const level = headerMatch[1].length as HeaderLevel;
    const content = headerMatch[2];
    const children = this.parseInlineElements(content);
    const node = this.createNode(`header${level}` as NodeType, content, line, children) as BlockNode;
    node.metadata = { level };

    return [node, startIndex];
  }

  private parseBlockquote(lines: string[], startIndex: number): [BlockNode, number] {
    let content = lines[startIndex].slice(2);
    let currentIndex = startIndex + 1;
    let blockLines = [content];
    
    while (currentIndex < lines.length && lines[currentIndex].startsWith('> ')) {
      blockLines.push(lines[currentIndex].slice(2));
      currentIndex++;
    }
    
    content = blockLines.join('\n');
    const children = this.parseInlineElements(content);
    const node = this.createNode('blockquote', content, lines.slice(startIndex, currentIndex).join('\n'), children) as BlockNode;
    
    return [node, currentIndex - 1];
  }

  private parseCodeBlock(lines: string[], startIndex: number): [BlockNode, number] {
    const language = lines[startIndex].slice(3).trim();
    let content = '';
    let currentIndex = startIndex + 1;
    
    while (currentIndex < lines.length && !lines[currentIndex].startsWith('```')) {
      content += (content ? '\n' : '') + lines[currentIndex];
      currentIndex++;
    }
    
    if (currentIndex < lines.length) {
      const node = this.createNode('codeBlock', content, lines.slice(startIndex, currentIndex + 1).join('\n')) as BlockNode;
      node.metadata = { language };
      return [node, currentIndex];
    }
    
    throw new Error('Unclosed code block');
  }

  private parseParagraph(lines: string[], startIndex: number): [BlockNode, number] {
    const content = lines[startIndex];
    const children = this.parseInlineElements(content);
    const node = this.createNode('paragraph', content, lines[startIndex], children) as BlockNode;
    return [node, startIndex];
  }

  private parseBlockElements(lines: string[]): BlockNode[] {
    const nodes: BlockNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmedLine = line.trim();

      if (trimmedLine === '') {
        i++;
        continue;
      }

      if (trimmedLine.startsWith('#')) {
        const [node, nextIndex] = this.parseHeader(lines, i);
        nodes.push(node);
        i = nextIndex + 1;
      } else if (trimmedLine.startsWith('>')) {
        const [node, nextIndex] = this.parseBlockquote(lines, i);
        nodes.push(node);
        i = nextIndex + 1;
      } else if (trimmedLine.startsWith('```')) {
        const [node, nextIndex] = this.parseCodeBlock(lines, i);
        nodes.push(node);
        i = nextIndex + 1;
      } else if (trimmedLine.match(/^[-*+]\s+/) || trimmedLine.match(/^\d+\.\s+/)) {
        const [node, nextIndex] = this.parseList(lines, i);
        nodes.push(node);
        i = nextIndex + 1;
      } else {
        const [node, nextIndex] = this.parseParagraph(lines, i);
        nodes.push(node);
        i = nextIndex + 1;
      }
    }

    return this.mergeTextNodes(nodes);
  }

  parse(input: string): BlockNode {
    const lines = input.split('\n');
    const nodes = this.parseBlockElements(lines);
    const documentNode = this.createNode('document', input, input, nodes) as BlockNode;
    return documentNode;
  }

  public visit(node: Node, visitor: Visitor) {
    visitor(node);

    if (this.isBlockType(node.type)) {
      const blockNode = node as BlockNode;
      if (blockNode.children) {
        blockNode.children.forEach(child => this.visit(child, visitor));
      }
    }
  }
} 