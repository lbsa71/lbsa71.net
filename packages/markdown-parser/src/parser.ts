import { ParserOptions, Token, TokenContext, TokenType, Position } from './types';

export class MarkdownParser {
  private pos: Position;
  private buffer: string;
  private current: TokenContext | null;
  private options: ParserOptions;

  constructor(options: ParserOptions) {
    this.options = options;
    this.pos = { line: 1, column: 1, offset: 0 };
    this.buffer = '';
    this.current = null;
  }

  private createContext(type: TokenType, content: string, raw: string): TokenContext {
    return {
      type,
      content,
      raw,
      position: { ...this.pos },
      parent: this.current || undefined
    };
  }

  private flushToken(type: TokenType, content: string, raw: string) {
    const context = this.createContext(type, content, raw);
    
    switch (type) {
      case 'header1':
      case 'header2':
      case 'header3':
      case 'header4':
      case 'header5':
      case 'header6':
        this.options.callbacks.onHeader?.(context);
        break;
      case 'paragraph':
        this.options.callbacks.onParagraph?.(context);
        break;
      case 'link':
        const [href, title] = this.parseLinkParts(content);
        this.options.callbacks.onLink?.({ ...context, href, title });
        break;
      case 'image':
        const [src, alt] = this.parseImageParts(content);
        this.options.callbacks.onImage?.({ ...context, src, alt });
        break;
      case 'horizontalRule':
        this.options.callbacks.onHorizontalRule?.(context);
        break;
      case 'citation':
        const cite = this.parseCitation(content);
        this.options.callbacks.onCitation?.({ ...context, cite });
        break;
      case 'text':
        this.options.callbacks.onText?.(context);
        break;
    }
  }

  private parseLinkParts(content: string): [string, string | undefined] {
    const match = content.match(/\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)/);
    if (!match) return ['', undefined];
    return [match[2], match[3]];
  }

  private parseImageParts(content: string): [string, string | undefined] {
    const match = content.match(/!\[(.*?)\]\((.*?)\)/);
    if (!match) return ['', undefined];
    return [match[2], match[1]];
  }

  private parseCitation(content: string): string {
    return content.replace(/^\[(\d+)\]$/, '$1');
  }

  private isCitation(text: string): boolean {
    return /^\[\d+\]$/.test(text);
  }

  private processInlineElements(line: string): void {
    let pos = 0;
    let lastPos = 0;
    let paragraphContent = '';
    
    const flushParagraph = () => {
      if (paragraphContent.trim()) {
        this.flushToken('paragraph', paragraphContent.trim(), line);
        paragraphContent = '';
      }
    };

    while (pos < line.length) {
      if (line[pos] === '[') {
        // Check for citation
        const closePos = line.indexOf(']', pos);
        if (closePos > -1) {
          const potentialCitation = line.slice(pos, closePos + 1);
          if (this.isCitation(potentialCitation)) {
            // Add text before citation to paragraph
            paragraphContent += line.slice(lastPos, pos);
            flushParagraph();
            
            this.flushToken('citation', potentialCitation, potentialCitation);
            pos = closePos + 1;
            lastPos = pos;
            continue;
          }
        }

        // Check for link
        const linkEnd = line.indexOf(')', line.indexOf('](', pos));
        if (linkEnd > -1 && line.indexOf('](', pos) > -1) {
          // Add text before link to paragraph
          paragraphContent += line.slice(lastPos, pos);
          flushParagraph();
          
          const linkText = line.slice(pos, linkEnd + 1);
          this.flushToken('link', linkText, linkText);
          pos = linkEnd + 1;
          lastPos = pos;
          continue;
        }
      } else if (line[pos] === '!' && line[pos + 1] === '[') {
        const imageEnd = line.indexOf(')', line.indexOf('](', pos));
        if (imageEnd > -1 && line.indexOf('](', pos) > -1) {
          // Add text before image to paragraph
          paragraphContent += line.slice(lastPos, pos);
          flushParagraph();
          
          const imageText = line.slice(pos, imageEnd + 1);
          this.flushToken('image', imageText, imageText);
          pos = imageEnd + 1;
          lastPos = pos;
          continue;
        }
      }
      
      pos++;
    }
    
    // Add remaining text to paragraph
    if (lastPos < line.length) {
      paragraphContent += line.slice(lastPos);
    }
    
    // Flush any remaining paragraph content
    if (paragraphContent.trim()) {
      this.flushToken('paragraph', paragraphContent.trim(), line);
    }
  }

  parse(input: string): void {
    const lines = input.split('\n');
    
    for (const line of lines) {
      if (line.match(/^#{1,6}\s/)) {
        const level = line.match(/^(#{1,6})\s/)?.[1].length || 1;
        const content = line.replace(/^#{1,6}\s/, '');
        this.flushToken(`header${level}` as TokenType, content, line);
      } else if (line.match(/^---+$/)) {
        this.flushToken('horizontalRule', '', line);
      } else if (line.trim() === '') {
        // Skip empty lines
        continue;
      } else {
        // Process line with potential inline elements
        this.processInlineElements(line);
      }
      
      this.pos.line++;
      this.pos.column = 1;
    }
  }
} 