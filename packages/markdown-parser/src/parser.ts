import { ParserOptions, BlockNode, InlineNode, Node, NodeType, Position, Visitor, BlockNodeType } from './types';

export class MarkdownParser {
  private pos: Position;

  constructor(private options: ParserOptions = {}) {
    this.pos = { line: 1, column: 1, offset: 0 };
  }

  private createNode<T extends Node>(type: NodeType, content: string, raw: string, metadata = {}, children: (BlockNode | InlineNode)[] = []): T {
    return {
      type,
      content,
      raw,
      position: { ...this.pos },
      metadata,
      ...(this.isBlockType(type) ? { children } : {}),
    } as T;
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

  private mergeTextNodes(nodes: InlineNode[]): InlineNode[] {
    const merged: InlineNode[] = [];
    let currentText = '';
    let currentRaw = '';

    for (const node of nodes) {
      if (node.type === 'text') {
        currentText += node.content;
        currentRaw += node.raw;
      } else {
        if (currentText) {
          merged.push(this.createNode('text', currentText, currentRaw));
          currentText = '';
          currentRaw = '';
        }
        merged.push(node);
      }
    }

    if (currentText) {
      merged.push(this.createNode('text', currentText, currentRaw));
    }

    return merged;
  }

  private parseInlineElements(text: string): InlineNode[] {
    const nodes: InlineNode[] = [];
    let pos = 0;
    let start = 0;
    const len = text.length;

    const pushText = (end: number) => {
      if (end > start) {
        const content = text.slice(start, end);
        if (content) {
          nodes.push(this.createNode('text', content, content));
        }
      }
    };

    while (pos < len) {
      // Bold
      if (text.startsWith('**', pos) || text.startsWith('__', pos)) {
        const marker = text.substr(pos, 2);
        const endPos = text.indexOf(marker, pos + 2);
        if (endPos !== -1) {
          pushText(pos);
          const content = text.slice(pos + 2, endPos);
          nodes.push(this.createNode('bold', content, text.slice(pos, endPos + 2)));
          pos = endPos + 2;
          start = pos;
          continue;
        }
      }

      // Italic
      if ((text[pos] === '*' || text[pos] === '_') && text[pos - 1] !== text[pos]) {
        const marker = text[pos];
        const endPos = text.indexOf(marker, pos + 1);
        if (endPos !== -1 && text[endPos - 1] !== '\\') {
          pushText(pos);
          const content = text.slice(pos + 1, endPos);
          nodes.push(this.createNode('italic', content, text.slice(pos, endPos + 1)));
          pos = endPos + 1;
          start = pos;
          continue;
        }
      }

      // Inline code
      if (text[pos] === '`') {
        const endPos = text.indexOf('`', pos + 1);
        if (endPos !== -1) {
          pushText(pos);
          const content = text.slice(pos + 1, endPos);
          nodes.push(this.createNode('code', content, text.slice(pos, endPos + 1)));
          pos = endPos + 1;
          start = pos;
          continue;
        }
      }

      // Links
      if (text[pos] === '[') {
        const titleEnd = text.indexOf(']', pos);
        const linkStart = titleEnd !== -1 ? text.indexOf('(', titleEnd) : -1;
        const linkEnd = linkStart !== -1 ? text.indexOf(')', linkStart) : -1;
        
        if (titleEnd !== -1 && linkStart !== -1 && linkEnd !== -1) {
          pushText(pos);
          const title = text.slice(pos + 1, titleEnd);
          const href = text.slice(linkStart + 1, linkEnd);
          
          // Extract optional title from href
          const hrefParts = href.match(/^([^"]+)(?:\s+"([^"]+)")?$/);
          const metadata = hrefParts
            ? { href: hrefParts[1], title: hrefParts[2] }
            : { href };
          
          nodes.push(this.createNode('link', title, text.slice(pos, linkEnd + 1), metadata));
          pos = linkEnd + 1;
          start = pos;
          continue;
        }
      }

      // Images
      if (text[pos] === '!' && text[pos + 1] === '[') {
        let bracketCount = 1;
        let altEnd = pos + 2;
        
        while (altEnd < len && bracketCount > 0) {
          if (text[altEnd] === '[') {
            bracketCount++;
          } else if (text[altEnd] === ']') {
            bracketCount--;
          }
          altEnd++;
        }
        
        const srcStart = text.indexOf('(', altEnd - 1);
        const srcEnd = srcStart !== -1 ? text.indexOf(')', srcStart) : -1;
        
        if (altEnd > pos + 2 && srcStart !== -1 && srcEnd !== -1) {
          pushText(pos);
          const alt = text.slice(pos + 2, altEnd - 1);
          const src = text.slice(srcStart + 1, srcEnd);
          
          nodes.push(this.createNode('image', '', text.slice(pos, srcEnd + 1), { src, alt }));
          pos = srcEnd + 1;
          start = pos;
          continue;
        }
      }

      // Citations
      if (text[pos] === '[' && /^\[\d+\]/.test(text.slice(pos))) {
        const end = text.indexOf(']', pos);
        if (end !== -1) {
          pushText(pos);
          const cite = text.slice(pos + 1, end);
          nodes.push(this.createNode('citation', cite, text.slice(pos, end + 1), { cite }));
          pos = end + 1;
          start = pos;
          continue;
        }
      }

      pos++;
    }

    pushText(pos);
    return this.mergeTextNodes(nodes);
  }

  private parseBlockElements(lines: string[]): BlockNode[] {
    const nodes: BlockNode[] = [];
    let pos = 0;
    
    while (pos < lines.length) {
      const line = lines[pos];
      this.updatePosition(pos + 1);
      
      // Headers
      const headerMatch = line.match(/^(#{1,6})\s(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const content = headerMatch[2];
        const children = this.parseInlineElements(content);
        const node = this.createNode<BlockNode>(`header${level}` as NodeType, content, line, { level }, children);
        nodes.push(node);
        pos++;
        continue;
      }

      // Blockquotes
      if (line.startsWith('> ')) {
        let content = line.slice(2);
        let currentPos = pos + 1;
        let blockLines = [content];
        
        while (currentPos < lines.length && lines[currentPos].startsWith('> ')) {
          blockLines.push(lines[currentPos].slice(2));
          currentPos++;
        }
        
        content = blockLines.join('\n');
        const children = this.parseInlineElements(content);
        const node = this.createNode<BlockNode>('blockquote', content, lines.slice(pos, currentPos).join('\n'), {}, children);
        nodes.push(node);
        pos = currentPos;
        continue;
      }

      // Code blocks
      if (line.startsWith('```')) {
        const language = line.slice(3).trim();
        let content = '';
        let currentPos = pos + 1;
        
        while (currentPos < lines.length && !lines[currentPos].startsWith('```')) {
          content += (content ? '\n' : '') + lines[currentPos];
          currentPos++;
        }
        
        if (currentPos < lines.length) {
          const node = this.createNode<BlockNode>('codeBlock', content, lines.slice(pos, currentPos + 1).join('\n'), { language });
          nodes.push(node);
          pos = currentPos + 1;
          continue;
        }
      }

      // Horizontal rules
      if (line.match(/^---+$/)) {
        nodes.push(this.createNode<BlockNode>('horizontalRule', '', line));
        pos++;
        continue;
      }

      // Regular paragraph
      if (line.trim()) {
        const content = line;
        const children = this.parseInlineElements(content);
        const node = this.createNode<BlockNode>('paragraph', content, line, {}, children);
        nodes.push(node);
      }
      pos++;
    }

    return nodes;
  }

  parse(input: string): BlockNode {
    const lines = input.split('\n');
    const children = this.parseBlockElements(lines);
    return this.createNode<BlockNode>('document', input, input, {}, children);
  }

  public visit(node: Node, visitor: Visitor) {
    visitor(node.type);

    if (this.isBlockType(node.type)) {
      const blockNode = node as BlockNode;
      if (blockNode.children) {
        blockNode.children.forEach(child => this.visit(child, visitor));
      }
    }
  }
} 