/*
TODO:
This is a new markdown parser that is based on the @lbsa71/markdown-parser library.
It should be able to parse the same markdown as src/lib/markdownParser.ts.

After implementing, the tests in src/lib/__tests__/newMarkdownParser.test.ts should pass.
*/

import { MarkdownParser } from "@lbsa71/markdown-parser";
import { ParsedDocument, HeaderNode, 
    TextNode, LinkNode, TrackInfoNode, 
    ParagraphNode, Node, ImageNode, InlineNode } from "./types";

    
export function parseMarkdown(markdown: string): ParsedDocument {
    // TODO: Implement the parser using the @lbsa71/markdown-parser library to parse the markdown
    // and return nodes and tracks, identical to src/lib/markdownParser.ts.
    const parser = new MarkdownParser();
    const document = parser.parse(markdown);

    // TODO: Convert the document to the types in src/lib/types.ts
    // and return the nodes and tracks.

    return {
        nodes: [],
        tracks: []
    };
}