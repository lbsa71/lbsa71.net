import { MarkdownParser } from '../../src/core/parser';
import { NodeDefinitionProvider, ParserState } from '../../src/types';

type TestNode = {
  type: string;
  content: string;
};

class TestProvider implements NodeDefinitionProvider<TestNode> {
  initialize() {
    return {};
  }

  shouldFlush(state: ParserState): boolean {
    return state.currentLine.trim() === '';
  }

  createNode(state: ParserState): TestNode | null {
    if (state.buffer.length === 0) return null;
    return {
      type: 'paragraph',
      content: state.buffer.join('\n')
    };
  }

  shouldAddToBuffer(state: ParserState): boolean {
    return state.currentLine.trim() !== '';
  }

  finalize(state: ParserState): TestNode | null {
    return this.createNode(state);
  }
}

describe('MarkdownParser', () => {
  let parser: MarkdownParser<TestNode>;
  let provider: TestProvider;

  beforeEach(() => {
    provider = new TestProvider();
    parser = new MarkdownParser(provider);
  });

  it('should parse simple paragraphs', () => {
    const input = 'First paragraph\nstill first\n\nSecond paragraph';
    const result = parser.parse(input);

    expect(result.nodes).toHaveLength(2);
    expect(result.nodes[0]).toEqual({
      type: 'paragraph',
      content: 'First paragraph\nstill first'
    });
    expect(result.nodes[1]).toEqual({
      type: 'paragraph',
      content: 'Second paragraph'
    });
  });

  it('should handle empty input', () => {
    const result = parser.parse('');
    expect(result.nodes).toHaveLength(0);
  });

  it('should handle single line input', () => {
    const result = parser.parse('Single line');
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0]).toEqual({
      type: 'paragraph',
      content: 'Single line'
    });
  });

  it('should preserve context between nodes', () => {
    class ContextProvider extends TestProvider {
      initialize() {
        return { count: 0 };
      }

      createNode(state: ParserState): TestNode | null {
        const node = super.createNode(state);
        if (node) {
          state.context.count = (state.context.count as number) + 1;
        }
        return node;
      }
    }

    const contextParser = new MarkdownParser(new ContextProvider());
    const result = contextParser.parse('First\n\nSecond\n\nThird');

    expect(result.context).toEqual({ count: 3 });
    expect(result.nodes).toHaveLength(3);
  });
}); 