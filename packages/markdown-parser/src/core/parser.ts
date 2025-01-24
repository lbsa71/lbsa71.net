import { NodeDefinitionProvider, ParserState, ParserResult } from '../types';

export class MarkdownParser<T> {
  constructor(private provider: NodeDefinitionProvider<T>) {}

  parse(markdown: string): ParserResult<T> {
    const lines = markdown.split('\n');
    const nodes: T[] = [];
    
    const state: ParserState = {
      currentLine: '',
      lineNumber: 0,
      buffer: [],
      context: this.provider.initialize()
    };

    for (let i = 0; i < lines.length; i++) {
      state.currentLine = lines[i];
      state.lineNumber = i + 1;

      if (this.provider.shouldFlush(state)) {
        this.flushBuffer(state, nodes);
      }

      if (this.provider.shouldAddToBuffer(state)) {
        state.buffer.push(state.currentLine);
      }
    }

    // Handle any remaining content
    const finalNodes = this.provider.finalize(state);
    if (finalNodes) {
      nodes.push(...(Array.isArray(finalNodes) ? finalNodes : [finalNodes]));
    }

    return {
      nodes,
      context: state.context
    };
  }

  private flushBuffer(state: ParserState, nodes: T[]): void {
    const newNodes = this.provider.createNode(state);
    if (newNodes) {
      nodes.push(...(Array.isArray(newNodes) ? newNodes : [newNodes]));
    }
    state.buffer = [];
  }
} 