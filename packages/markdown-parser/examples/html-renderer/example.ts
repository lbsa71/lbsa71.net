import { HtmlRenderer } from './renderer';

const markdown = `# Markdown Parser Example

This example demonstrates the capabilities of our **markdown parser** and *HTML renderer*.

## Features

1. Headers with different levels
2. Text formatting:
   - **Bold text** using \`**\` or \`__\`
   - *Italic text* using \`*\` or \`_\`
   - \`Inline code\` using backticks

## Links and Images

Check out [this link](https://example.com "Example Website") for more information.

Here's an image: ![Example](https://example.com/image.jpg)

## Code Blocks

\`\`\`typescript
function greet(name: string): void {
  console.log(\`Hello, \${name}!\`);
}
\`\`\`

## Blockquotes

> This is a blockquote
> With multiple lines
> And more content

## Citations

As mentioned in [1] and further discussed in [42], this is a great feature.

---

That's all folks!`;

const renderer = new HtmlRenderer();
const html = renderer.render(markdown);

console.log(html); 