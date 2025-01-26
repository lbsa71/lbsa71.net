import { HtmlRenderer } from '../renderer';

describe('HtmlRenderer', () => {
  let renderer: HtmlRenderer;

  beforeEach(() => {
    renderer = new HtmlRenderer();
  });

  it('should render headers', () => {
    const input = '# Header 1\n## Header 2\n### Header 3';
    const expected = '<h1>Header 1</h1>\n<h2>Header 2</h2>\n<h3>Header 3</h3>';
    expect(renderer.render(input)).toBe(expected);
  });

  it('should render paragraphs with inline formatting', () => {
    const input = 'This is a **bold** and *italic* text.';
    const expected = '<p>This is a <strong>bold</strong> and <em>italic</em> text.</p>';
    expect(renderer.render(input)).toBe(expected);
  });

  it('should render links and images', () => {
    const input = 'Check out [this link](https://example.com "Example")\n\n![Alt text](image.jpg)';
    const expected = '<p>Check out <a href="https://example.com" title="Example">this link</a></p>\n<p><img src="image.jpg" alt="Alt text"></p>';
    expect(renderer.render(input)).toBe(expected);
  });

  it('should render blockquotes', () => {
    const input = '> This is a quote\n> With multiple lines\n\n> Another quote';
    const expected = '<blockquote>This is a quote\nWith multiple lines</blockquote>\n<blockquote>Another quote</blockquote>';
    expect(renderer.render(input)).toBe(expected);
  });

  it('should render code blocks with language', () => {
    const input = '```typescript\nconst x: number = 42;\n```';
    const expected = '<pre><code class="language-typescript">const x: number = 42;</code></pre>';
    expect(renderer.render(input)).toBe(expected);
  });

  it('should render citations', () => {
    const input = 'As mentioned in [1] and [42]';
    const expected = '<p>As mentioned in <cite>[1]</cite> and <cite>[42]</cite></p>';
    expect(renderer.render(input)).toBe(expected);
  });

  it('should escape HTML special characters', () => {
    const input = 'Text with <script> and & symbols';
    const expected = '<p>Text with &lt;script&gt; and &amp; symbols</p>';
    expect(renderer.render(input)).toBe(expected);
  });

  it('should render a complex document', () => {
    const input = `# Main Title

This is a paragraph with **bold** and *italic* text.
It also has a [link](https://example.com).

## Code Example
\`\`\`typescript
function hello(name: string): void {
  console.log(\`Hello, \${name}!\`);
}
\`\`\`

> A wise quote
> With multiple lines

![Example](image.jpg)

See reference [1] for more details.`;

    const expected = `<h1>Main Title</h1>
<p>This is a paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
<p>It also has a <a href="https://example.com">link</a>.</p>
<h2>Code Example</h2>
<pre><code class="language-typescript">function hello(name: string): void {
  console.log(\`Hello, \${name}!\`);
}</code></pre>
<blockquote>A wise quote
With multiple lines</blockquote>
<p><img src="image.jpg" alt="Example"></p>
<p>See reference <cite>[1]</cite> for more details.</p>`;

    expect(renderer.render(input)).toBe(expected);
  });
}); 