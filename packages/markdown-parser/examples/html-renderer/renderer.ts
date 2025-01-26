import { MarkdownParser, Node, NodeType, BlockNode, InlineNode } from '../../src';

export class HtmlRenderer {
  private result: string[] = [];
  private inlineResult: string[] = [];
  private isInline = false;

  constructor(private parser: MarkdownParser = new MarkdownParser()) {}

  private escape(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private renderNode(node: Node): void {
    switch (node.type) {
      case 'document':
        this.renderChildren(node as BlockNode);
        break;

      case 'header1':
      case 'header2':
      case 'header3':
      case 'header4':
      case 'header5':
      case 'header6':
        const level = node.type.slice(-1);
        this.result.push(`<h${level}>${node.content}</h${level}>`);
        break;

      case 'paragraph':
        this.isInline = true;
        this.inlineResult = [];
        this.renderChildren(node as BlockNode);
        this.result.push(`<p>${this.inlineResult.join('')}</p>`);
        this.isInline = false;
        break;

      case 'blockquote':
        this.isInline = true;
        this.inlineResult = [];
        this.renderChildren(node as BlockNode);
        this.result.push(`<blockquote>${node.content}</blockquote>`);
        this.isInline = false;
        break;

      case 'codeBlock':
        const language = node.metadata?.language;
        this.result.push(`<pre><code${language ? ` class="language-${language}"` : ''}>${this.escape(node.content)}</code></pre>`);
        break;

      case 'horizontalRule':
        this.result.push('<hr>');
        break;

      case 'text':
        this.inlineResult.push(this.escape(node.content));
        break;

      case 'bold':
        this.inlineResult.push(`<strong>${this.escape(node.content)}</strong>`);
        break;

      case 'italic':
        this.inlineResult.push(`<em>${this.escape(node.content)}</em>`);
        break;

      case 'code':
        this.inlineResult.push(`<code>${this.escape(node.content)}</code>`);
        break;

      case 'link':
        const href = this.escape(node.metadata?.href || '');
        const title = node.metadata?.title ? ` title="${this.escape(node.metadata.title)}"` : '';
        this.inlineResult.push(`<a href="${href}"${title}>${this.escape(node.content)}</a>`);
        break;

      case 'image':
        const src = this.escape(node.metadata?.src || '');
        const alt = this.escape(node.metadata?.alt || '');
        this.inlineResult.push(`<img src="${src}" alt="${alt}">`);
        break;

      case 'citation':
        const cite = this.escape(node.metadata?.cite || '');
        this.inlineResult.push(`<cite>[${cite}]</cite>`);
        break;
    }
  }

  private renderChildren(node: BlockNode): void {
    for (const child of node.children) {
      this.renderNode(child);
    }
  }

  render(input: string): string {
    const ast = this.parser.parse(input);
    this.result = [];
    this.renderNode(ast);
    return this.result.join('\n');
  }
} 