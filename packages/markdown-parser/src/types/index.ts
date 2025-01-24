export type ParserState = {
  currentLine: string;
  lineNumber: number;
  buffer: string[];
  context: Record<string, unknown>;
};

export type ParserResult<T> = {
  nodes: T[];
  context: Record<string, unknown>;
};

export interface NodeDefinitionProvider<T> {
  // Called at the start of parsing to initialize any context
  initialize(): Record<string, unknown>;
  
  // Called for each line to determine if it should trigger a node flush
  shouldFlush(state: ParserState): boolean;
  
  // Called when a flush is triggered to create a node from the current buffer
  createNode(state: ParserState): T | T[] | null;
  
  // Called to determine if the current line should be added to the buffer
  shouldAddToBuffer(state: ParserState): boolean;
  
  // Called at the end of parsing to handle any remaining buffer
  finalize(state: ParserState): T | T[] | null;
} 