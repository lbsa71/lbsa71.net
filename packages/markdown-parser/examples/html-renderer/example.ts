import { readFileSync } from 'fs';
import { join } from 'path';
import { MarkdownParser } from '../../src/parser';
import { HtmlRenderer } from './renderer';

const readmePath = join(__dirname, '../../README.md');
const readmeContent = readFileSync(readmePath, 'utf-8');

const parser = new MarkdownParser();
const renderer = new HtmlRenderer();
const ast = parser.parse(readmeContent);
const html = renderer.render(ast);

console.log(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Markdown Parser Documentation</title>
  <style>
    body {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    pre {
      background: #f6f8fa;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
    }
    code {
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
      font-size: 0.9em;
    }
    blockquote {
      margin: 0;
      padding-left: 1rem;
      border-left: 4px solid #ddd;
      color: #666;
    }
    img {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
${html}
</body>
</html>`); 