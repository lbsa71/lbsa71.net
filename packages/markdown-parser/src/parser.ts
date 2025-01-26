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
    let textStart = pos;

    const addTextNode = (end: number) => {
      if (end > textStart) {
        const content = text.slice(textStart, end);
        if (content) {
          nodes.push(this.createNode('text', content, content) as InlineNode);
        }
      }
    };

    while (pos < text.length) {
      const char = text[pos];

      if (char === '!' && text[pos + 1] === '[') {
        addTextNode(pos);
        const endBracket = this.findClosingBracket(text, pos + 2);
        if (endBracket !== -1) {
          const nextChar = text[endBracket + 1];
          if (nextChar === '(') {
            const endParen = text.indexOf(')', endBracket + 2);
            if (endParen !== -1) {
              const alt = text.slice(pos + 2, endBracket);
              const urlAndTitle = text.slice(endBracket + 2, endParen);
              const [url, title] = this.parseUrlAndTitle(urlAndTitle);
              const node = this.createNode('image', '', text.slice(pos, endParen + 1));
              node.metadata = { url, alt, ...(title ? { title } : {}) };
              nodes.push(node as InlineNode);
              pos = endParen + 1;
              textStart = pos;
              continue;
            }
          }
        }
      }

      if (char === '[') {
        const endBracket = text.indexOf(']', pos);
        if (endBracket !== -1) {
          // Check if it's a citation (just a number in brackets)
          const citationContent = text.slice(pos + 1, endBracket);
          if (/^\d+$/.test(citationContent)) {
            addTextNode(pos);
            const node = this.createNode('citation', citationContent, text.slice(pos, endBracket + 1));
            node.metadata = { cite: citationContent };
            nodes.push(node as InlineNode);
            pos = endBracket + 1;
            textStart = pos;
            continue;
          }

          const nextChar = text[endBracket + 1];
          if (nextChar === '(') {
            addTextNode(pos);
            const endParen = text.indexOf(')', endBracket + 2);
            if (endParen !== -1) {
              const content = text.slice(pos + 1, endBracket);
              const urlAndTitle = text.slice(endBracket + 2, endParen);
              const [url, title] = this.parseUrlAndTitle(urlAndTitle);
              const node = this.createNode('link', content, text.slice(pos, endParen + 1));
              node.metadata = { url, ...(title ? { title } : {}) };
              nodes.push(node as InlineNode);
              pos = endParen + 1;
              textStart = pos;
              continue;
            }
          }
        }
        pos++;
        continue;
      }

      if (char === '*' || char === '_') {
        const isDouble = text[pos + 1] === char;
        const type = isDouble ? 'bold' : 'italic';
        const length = isDouble ? 2 : 1;
        const endPos = text.indexOf(char.repeat(length), pos + length);

        if (endPos !== -1 && endPos > pos + length) {
          addTextNode(pos);
          const content = text.slice(pos + length, endPos);
          const children = this.parseInlineElements(content);
          const node = this.createNode(type, content, text.slice(pos, endPos + length), children);
          nodes.push(node as InlineNode);
          pos = endPos + length;
          textStart = pos;
          continue;
        }
      }

      if (char === '`') {
        addTextNode(pos);
        const endPos = text.indexOf('`', pos + 1);
        if (endPos !== -1) {
          const content = text.slice(pos + 1, endPos);
          const node = this.createNode('code', content, text.slice(pos, endPos + 1));
          nodes.push(node as InlineNode);
          pos = endPos + 1;
          textStart = pos;
          continue;
        }
      }

      pos++;
    }

    addTextNode(pos);
    return nodes;
  }

  private parseUrlAndTitle(text: string): [string, string | undefined] {
    const titleMatch = text.match(/^([^"]+)\s+"([^"]+)"$/);
    if (titleMatch) {
      return [titleMatch[1], titleMatch[2]];
    }
    return [text, undefined];
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

    this.currentLine = startIndex + 1;
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
    visitor(node.type);
    if (this.isBlockType(node.type)) {
      const blockNode = node as BlockNode;
      if (blockNode.children) {
        for (const child of blockNode.children) {
          this.visit(child, visitor);
        }
      }
    }
  }

  private findClosingBracket(text: string, start: number): number {
    let depth = 1;
    let pos = start;
    while (pos < text.length) {
      if (text[pos] === '[') {
        depth++;
      } else if (text[pos] === ']') {
        depth--;
        if (depth === 0) {
          return pos;
        }
      }
      pos++;
    }
    return -1;
  }
} 