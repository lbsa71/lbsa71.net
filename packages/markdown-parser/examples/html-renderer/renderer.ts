import { MarkdownParser, Node, NodeType, BlockNode, InlineNode } from '../../src';

export class HtmlRenderer {
  private result: string[] = [];
  private isInline = false;
  private inlineResult: string[] = [];

  constructor() {}

  render(node: BlockNode): string {
    this.renderNode(node);
    return this.result.join('');
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
        this.result.push(`<p>${this.inlineResult.join('')}</p>`);
        this.isInline = false;
        break;

      case 'blockquote':
        this.isInline = true;
        this.inlineResult = [];
        this.renderChildren(node as BlockNode);
        this.result.push(`<blockquote>${this.inlineResult.join('')}</blockquote>`);
        this.isInline = false;
        break;

      case 'list':
        const listType = node.metadata?.listType === 'ordered' ? 'ol' : 'ul';
        this.result.push(`<${listType}>`);
        this.renderChildren(node as BlockNode);
        this.result.push(`</${listType}>`);
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
        this.result.push('</li>');
        break;

      case 'codeBlock':
        const language = node.metadata?.language || '';
        this.result.push(`<pre><code class="language-${language}">${this.escape(node.content)}</code></pre>`);
        break;

      case 'text':
        this.inlineResult.push(this.escape(node.content));
        break;

      case 'bold':
        this.isInline = true;
        this.inlineResult = [];
        this.renderChildren(node as BlockNode);
        this.inlineResult.push(`<strong>${this.inlineResult.join('')}</strong>`);
        this.isInline = false;
        break;

      case 'italic':
        this.isInline = true;
        this.inlineResult = [];
        this.renderChildren(node as BlockNode);
        this.inlineResult.push(`<em>${this.inlineResult.join('')}</em>`);
        this.isInline = false;
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
        const cite = node.metadata?.url || '';
        this.inlineResult.push(`<cite cite="${cite}">${this.escape(node.content)}</cite>`);
        break;

      default:
        if (node.type.startsWith('header')) {
          const level = node.metadata?.level || 1;
          this.isInline = true;
          this.inlineResult = [];
          this.renderChildren(node as BlockNode);
          this.result.push(`<h${level}>${this.inlineResult.join('')}</h${level}>`);
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
} 