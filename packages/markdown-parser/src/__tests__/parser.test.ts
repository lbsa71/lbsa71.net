import { MarkdownParser } from '../parser';
import { ParserCallbacks, TokenContext } from '../types';

describe('MarkdownParser', () => {
  const createMockCallbacks = (): ParserCallbacks & { calls: TokenContext[] } => {
    const calls: TokenContext[] = [];
    return {
      calls,
      onHeader: (ctx: TokenContext) => calls.push(ctx),
      onParagraph: (ctx: TokenContext) => calls.push(ctx),
      onLink: (ctx: TokenContext) => calls.push(ctx),
      onImage: (ctx: TokenContext) => calls.push(ctx),
      onHorizontalRule: (ctx: TokenContext) => calls.push(ctx),
      onCitation: (ctx: TokenContext) => calls.push(ctx),
      onText: (ctx: TokenContext) => calls.push(ctx),
    };
  };

  it('should parse headers correctly with proper content and position', () => {
    const callbacks = createMockCallbacks();
    const parser = new MarkdownParser({ callbacks });
    
    parser.parse('# Header 1\n## Header 2\n### Deep header');
    
    expect(callbacks.calls).toHaveLength(3);
    expect(callbacks.calls[0]).toMatchObject({
      type: 'header1',
      content: 'Header 1',
      raw: '# Header 1',
      position: { line: 1, column: 1 }
    });
    expect(callbacks.calls[1]).toMatchObject({
      type: 'header2',
      content: 'Header 2',
      raw: '## Header 2',
      position: { line: 2, column: 1 }
    });
    expect(callbacks.calls[2]).toMatchObject({
      type: 'header3',
      content: 'Deep header',
      raw: '### Deep header',
      position: { line: 3, column: 1 }
    });
  });

  it('should parse links correctly with href and title', () => {
    const callbacks = createMockCallbacks();
    const parser = new MarkdownParser({ callbacks });
    
    parser.parse('Check out [this link](https://example.com "Example") and [another](https://test.com)');
    
    expect(callbacks.calls).toHaveLength(4); // text + link + text + link
    expect(callbacks.calls[0]).toMatchObject({
      type: 'paragraph',
      content: 'Check out'
    });
    expect(callbacks.calls[1]).toMatchObject({
      type: 'link',
      content: '[this link](https://example.com "Example")',
      href: 'https://example.com',
      title: 'Example'
    });
    expect(callbacks.calls[2]).toMatchObject({
      type: 'paragraph',
      content: 'and'
    });
    expect(callbacks.calls[3]).toMatchObject({
      type: 'link',
      content: '[another](https://test.com)',
      href: 'https://test.com',
      title: undefined
    });
  });

  it('should parse images correctly with src and alt text', () => {
    const callbacks = createMockCallbacks();
    const parser = new MarkdownParser({ callbacks });
    
    parser.parse('![Alt text](image.jpg)\n![](empty.png)\n![Complex alt with [brackets]](complex.jpg)');
    
    expect(callbacks.calls).toHaveLength(3);
    expect(callbacks.calls[0]).toMatchObject({
      type: 'image',
      content: '![Alt text](image.jpg)',
      src: 'image.jpg',
      alt: 'Alt text'
    });
    expect(callbacks.calls[1]).toMatchObject({
      type: 'image',
      content: '![](empty.png)',
      src: 'empty.png',
      alt: ''
    });
    expect(callbacks.calls[2]).toMatchObject({
      type: 'image',
      content: '![Complex alt with [brackets]](complex.jpg)',
      src: 'complex.jpg',
      alt: 'Complex alt with [brackets]'
    });
  });

  it('should parse horizontal rules with different markers', () => {
    const callbacks = createMockCallbacks();
    const parser = new MarkdownParser({ callbacks });
    
    parser.parse('---\n-----\n-------------------');
    
    expect(callbacks.calls).toHaveLength(3);
    callbacks.calls.forEach(call => {
      expect(call).toMatchObject({
        type: 'horizontalRule',
        content: '',
      });
    });
  });

  it('should parse citations in different contexts', () => {
    const callbacks = createMockCallbacks();
    const parser = new MarkdownParser({ callbacks });
    
    parser.parse('Reference [0]\nAnother [123]\nInvalid [abc]');
    
    expect(callbacks.calls).toHaveLength(5); // text + citation + text + citation + text
    expect(callbacks.calls[0]).toMatchObject({
      type: 'paragraph',
      content: 'Reference'
    });
    expect(callbacks.calls[1]).toMatchObject({
      type: 'citation',
      content: '[0]',
      cite: '0'
    });
    expect(callbacks.calls[2]).toMatchObject({
      type: 'paragraph',
      content: 'Another'
    });
    expect(callbacks.calls[3]).toMatchObject({
      type: 'citation',
      content: '[123]',
      cite: '123'
    });
    expect(callbacks.calls[4]).toMatchObject({
      type: 'paragraph',
      content: 'Invalid [abc]'
    });
  });

  it('should parse mixed content with proper nesting', () => {
    const callbacks = createMockCallbacks();
    const parser = new MarkdownParser({ callbacks });
    
    const markdown = `# Main Title
This is a [link](https://example.com) in a paragraph.
![Image](test.jpg) with text after.

## Section [1]
---
Final paragraph.`;
    
    parser.parse(markdown);
    
    const expectedSequence = [
      ['header1', 'Main Title'],
      ['paragraph', 'This is a'],
      ['link', '[link](https://example.com)'],
      ['paragraph', 'in a paragraph.'],
      ['image', '![Image](test.jpg)'],
      ['paragraph', 'with text after.'],
      ['header2', 'Section [1]'],
      ['horizontalRule', ''],
      ['paragraph', 'Final paragraph.']
    ];
    
    expect(callbacks.calls).toHaveLength(expectedSequence.length);
    callbacks.calls.forEach((call, index) => {
      expect(call).toMatchObject({
        type: expectedSequence[index][0],
        content: expectedSequence[index][1]
      });
    });
  });

  it('should parse the example markdown with full content validation', () => {
    const callbacks = createMockCallbacks();
    const parser = new MarkdownParser({ callbacks });
    
    const markdown = `# Science/Fiction 4.0
Concept and Live mixing: [lbsa71](https://soundcloud.com/lbsa71)
Track Selection, Story, Code: lbsa71, [Claude](https://claude.ai/) and [ChatGPT](https://openai.com/)
Images: ChatGPT

#### Pursuit - Gesaffelstein [0]
![Image 1](https://media.lbsa71.net/users/st_ephan/sf4/pursuit.webp)
Humanity's an addict, and progress is our drug of choice. We see a ledge, we leap - consequences be damned.`;
    
    parser.parse(markdown);
    
    const expectedSequence = [
      ['header1', 'Science/Fiction 4.0'],
      ['paragraph', 'Concept and Live mixing:'],
      ['link', '[lbsa71](https://soundcloud.com/lbsa71)'],
      ['paragraph', 'Track Selection, Story, Code: lbsa71,'],
      ['link', '[Claude](https://claude.ai/)'],
      ['paragraph', 'and'],
      ['link', '[ChatGPT](https://openai.com/)'],
      ['paragraph', 'Images: ChatGPT'],
      ['header4', 'Pursuit - Gesaffelstein [0]'],
      ['image', '![Image 1](https://media.lbsa71.net/users/st_ephan/sf4/pursuit.webp)'],
      ['paragraph', 'Humanity\'s an addict, and progress is our drug of choice. We see a ledge, we leap - consequences be damned.']
    ];
    
    expect(callbacks.calls).toHaveLength(expectedSequence.length);
    callbacks.calls.forEach((call, index) => {
      const [expectedType, expectedContent] = expectedSequence[index];
      expect(call).toMatchObject({
        type: expectedType,
        content: expectedContent,
        position: expect.objectContaining({
          line: expect.any(Number),
          column: expect.any(Number),
          offset: expect.any(Number)
        })
      });

      // Additional validations for specific types
      if (call.type === 'link') {
        expect(call).toHaveProperty('href');
      } else if (call.type === 'image') {
        expect(call).toHaveProperty('src');
        expect(call).toHaveProperty('alt');
      } else if (call.type === 'citation') {
        expect(call).toHaveProperty('cite');
      }
    });
  });
}); 