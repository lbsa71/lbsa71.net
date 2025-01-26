import { MarkdownParser, Node, NodeType, BlockNode, InlineNode } from '../../src';

export class HtmlRenderer {
  private result: string[] = [];
  private isInline = false;
  private inlineResult: string[] = [];

  constructor() {}

  render(input: string | BlockNode): string {
    this.result = [];
    const node = typeof input === 'string' ? new MarkdownParser().parse(input) : input;
    this.renderNode(node);
    return this.result.join('').replace(/\n+$/, '');
  }

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

      case 'paragraph':
        this.isInline = true;
        this.inlineResult = [];
        this.renderChildren(node as BlockNode);
        this.result.push(`<p>${this.inlineResult.join('')}</p>\n`);
        this.isInline = false;
        break;

      case 'blockquote':
        this.isInline = true;
        this.inlineResult = [];
        this.renderChildren(node as BlockNode);
        this.result.push(`<blockquote>${this.inlineResult.join('')}</blockquote>\n`);
        this.isInline = false;
        break;

      case 'list':
        const listType = node.metadata?.listType === 'ordered' ? 'ol' : 'ul';
        this.result.push(`<${listType}>\n`);
        this.renderChildren(node as BlockNode);
        this.result.push(`</${listType}>\n`);
        break;

      case 'listItem':
        this.result.push('<li>');
        for (const child of (node as BlockNode).children) {
          if (child.type === 'list') {
            this.renderNode(child);
          } else {
            this.isInline = true;
            this.inlineResult = [];
            this.renderNode(child);
            this.result.push(this.inlineResult.join(''));
            this.isInline = false;
          }
        }
        this.result.push('</li>\n');
        break;

      case 'codeBlock':
        const language = node.metadata?.language || '';
        this.result.push(`<pre><code class="language-${language}">${this.escape(node.content)}</code></pre>\n`);
        break;

      case 'text':
        this.inlineResult.push(this.escape(node.content));
        break;

      case 'bold':
        const boldContent = this.renderInline(node as BlockNode);
        this.inlineResult.push(`<strong>${boldContent}</strong>`);
        break;

      case 'italic':
        const italicContent = this.renderInline(node as BlockNode);
        this.inlineResult.push(`<em>${italicContent}</em>`);
        break;

      case 'link':
        const url = node.metadata?.url || '';
        const title = node.metadata?.title ? ` title="${this.escape(node.metadata.title)}"` : '';
        this.inlineResult.push(`<a href="${url}"${title}>${this.escape(node.content)}</a>`);
        break;

      case 'image':
        const src = node.metadata?.url || '';
        const alt = node.metadata?.alt || '';
        const imgTitle = node.metadata?.title ? ` title="${this.escape(node.metadata.title)}"` : '';
        this.inlineResult.push(`<img src="${src}" alt="${alt}"${imgTitle}>`);
        break;

      case 'code':
        this.inlineResult.push(`<code>${this.escape(node.content)}</code>`);
        break;

      case 'citation':
        const cite = node.metadata?.cite || '';
        this.inlineResult.push(`<cite>[${this.escape(cite)}]</cite>`);
        break;

      default:
        if (typeof node.type === 'string' && node.type.startsWith('header')) {
          const level = node.metadata?.level || 1;
          this.isInline = true;
          this.inlineResult = [];
          this.renderChildren(node as BlockNode);
          this.result.push(`<h${level}>${this.inlineResult.join('')}</h${level}>\n`);
          this.isInline = false;
        }
        break;
    }
  }

  private renderChildren(node: BlockNode): void {
    if (node.children) {
      for (const child of node.children) {
        this.renderNode(child);
      }
    }
  }

  private renderInline(node: BlockNode): string {
    const prevInlineResult = this.inlineResult;
    this.inlineResult = [];
    this.renderChildren(node);
    const result = this.inlineResult.join('');
    this.inlineResult = prevInlineResult;
    return result;
  }
} 