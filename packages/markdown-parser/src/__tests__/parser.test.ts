import { MarkdownParser } from '../parser';
import { BlockNode, InlineNode, Node, Visitor, NodeType } from '../types';

describe('MarkdownParser', () => {
  it('should parse headers into proper AST nodes', () => {
    const parser = new MarkdownParser();
    const ast = parser.parse('# Header 1\n## Header 2\n### Deep header');

    expect(ast.type).toBe('document');
    expect(ast.children).toHaveLength(3);

    const [h1, h2, h3] = ast.children as BlockNode[];
    
    expect(h1).toMatchObject({
      type: 'header1',
      content: 'Header 1',
      raw: '# Header 1',
      position: { line: 1, column: 1 },
      metadata: { level: 1 },
      children: [{ type: 'text', content: 'Header 1' }],
    });

    expect(h2).toMatchObject({
      type: 'header2',
      content: 'Header 2',
      raw: '## Header 2',
      position: { line: 2, column: 1 },
      metadata: { level: 2 },
      children: [{ type: 'text', content: 'Header 2' }],
    });

    expect(h3).toMatchObject({
      type: 'header3',
      content: 'Deep header',
      raw: '### Deep header',
      position: { line: 3, column: 1 },
      metadata: { level: 3 },
      children: [{ type: 'text', content: 'Deep header' }],
    });
  });

  it('should parse links into proper AST nodes', () => {
    const parser = new MarkdownParser();
    const ast = parser.parse('Check out [this link](https://example.com "Example") and [another](https://test.com)');

    expect(ast.type).toBe('document');
    expect(ast.children).toHaveLength(1);

    const [paragraph] = ast.children as BlockNode[];
    expect(paragraph.type).toBe('paragraph');
    expect(paragraph.children).toHaveLength(4);

    const [text1, link1, text2, link2] = paragraph.children as InlineNode[];
    
    expect(text1).toMatchObject({
      type: 'text',
      content: 'Check out ',
    });

    expect(link1).toMatchObject({
      type: 'link',
      content: 'this link',
      metadata: {
        url: 'https://example.com',
        title: 'Example',
      },
    });

    expect(text2).toMatchObject({
      type: 'text',
      content: ' and ',
    });

    expect(link2).toMatchObject({
      type: 'link',
      content: 'another',
      metadata: {
        url: 'https://test.com',
      },
    });
  });

  it('should parse images into proper AST nodes', () => {
    const parser = new MarkdownParser();
    const ast = parser.parse('![Alt text](image.jpg)\n![](empty.png)\n![Complex alt with [brackets]](complex.jpg)');

    expect(ast.type).toBe('document');
    expect(ast.children).toHaveLength(3);

    const [p1, p2, p3] = ast.children as BlockNode[];
    
    expect(p1.children[0]).toMatchObject({
      type: 'image',
      content: '',
      metadata: {
        url: 'image.jpg',
        alt: 'Alt text',
      },
    });

    expect(p2.children[0]).toMatchObject({
      type: 'image',
      content: '',
      metadata: {
        url: 'empty.png',
        alt: '',
      },
    });

    expect(p3.children[0]).toMatchObject({
      type: 'image',
      content: '',
      metadata: {
        url: 'complex.jpg',
        alt: 'Complex alt with [brackets]',
      },
    });
  });

  it('should parse blockquotes into proper AST nodes', () => {
    const parser = new MarkdownParser();
    const ast = parser.parse('> Single line quote\n> Multi-line\n> blockquote\n\n> Another quote');

    expect(ast.type).toBe('document');
    expect(ast.children).toHaveLength(2);

    const [quote1, quote2] = ast.children as BlockNode[];
    
    expect(quote1).toMatchObject({
      type: 'blockquote',
      content: 'Single line quote\nMulti-line\nblockquote',
      children: [{ type: 'text', content: 'Single line quote\nMulti-line\nblockquote' }],
    });

    expect(quote2).toMatchObject({
      type: 'blockquote',
      content: 'Another quote',
      children: [{ type: 'text', content: 'Another quote' }],
    });
  });

  it('should parse inline formatting into proper AST nodes', () => {
    const parser = new MarkdownParser();
    const ast = parser.parse('This is **bold** and *italic* text. Also __bold__ and _italic_.');

    expect(ast.type).toBe('document');
    expect(ast.children).toHaveLength(1);

    const [paragraph] = ast.children as BlockNode[];
    expect(paragraph.children).toHaveLength(9);

    const [text1, bold1, text2, italic1, text3, bold2, text4, italic2, text5] = paragraph.children as InlineNode[];
    
    expect(text1).toMatchObject({
      type: 'text',
      content: 'This is ',
    });

    expect(bold1).toMatchObject({
      type: 'bold',
      content: 'bold',
    });

    expect(text2).toMatchObject({
      type: 'text',
      content: ' and ',
    });

    expect(italic1).toMatchObject({
      type: 'italic',
      content: 'italic',
    });

    expect(text3).toMatchObject({
      type: 'text',
      content: ' text. Also ',
    });

    expect(bold2).toMatchObject({
      type: 'bold',
      content: 'bold',
    });

    expect(text4).toMatchObject({
      type: 'text',
      content: ' and ',
    });

    expect(italic2).toMatchObject({
      type: 'italic',
      content: 'italic',
    });

    expect(text5).toMatchObject({
      type: 'text',
      content: '.',
    });
  });

  it('should parse code blocks into proper AST nodes', () => {
    const parser = new MarkdownParser();
    const ast = parser.parse('```typescript\nconst x: number = 42;\n```\n\n```\nNo language specified\n```');

    expect(ast.type).toBe('document');
    expect(ast.children).toHaveLength(2);

    const [code1, code2] = ast.children as BlockNode[];
    
    expect(code1).toMatchObject({
      type: 'codeBlock',
      content: 'const x: number = 42;',
      metadata: { language: 'typescript' },
    });

    expect(code2).toMatchObject({
      type: 'codeBlock',
      content: 'No language specified',
      metadata: { language: '' },
    });
  });

  it('should parse citations into proper AST nodes', () => {
    const parser = new MarkdownParser();
    const ast = parser.parse('Reference [0]\nAnother [123]\nInvalid [abc]');

    expect(ast.type).toBe('document');
    expect(ast.children).toHaveLength(3);

    const [p1, p2, p3] = ast.children as BlockNode[];
    
    expect(p1.children).toHaveLength(2);
    expect(p1.children[1]).toMatchObject({
      type: 'citation',
      content: '0',
      metadata: { cite: '0' },
    });

    expect(p2.children).toHaveLength(2);
    expect(p2.children[1]).toMatchObject({
      type: 'citation',
      content: '123',
      metadata: { cite: '123' },
    });

    expect(p3.children).toHaveLength(1);
    expect(p3.children[0]).toMatchObject({
      type: 'text',
      content: 'Invalid [abc]',
    });
  });

  it('should support visitor pattern for AST traversal', () => {
    const parser = new MarkdownParser();
    const ast = parser.parse('# Title\nParagraph with **bold** text.');

    const visited: string[] = [];
    const visitor = (type: NodeType) => visited.push(type);

    parser.visit(ast, visitor);

    expect(visited).toEqual([
      'document',
      'header1',
      'text',
      'paragraph',
      'text',
      'bold',
      'text'
    ]);
  });
}); 