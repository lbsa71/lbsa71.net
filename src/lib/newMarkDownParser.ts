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

type BaseMarkdownNode = {
    type: string;
    content: string;
    raw: string;
    children?: BaseMarkdownNode[];
    metadata?: Record<string, any>;
};

type ParserError = {
    message: string;
    line?: number;
    column?: number;
    type: 'syntax' | 'structure' | 'validation';
};

type ParseResult = ParsedDocument & {
    errors: ParserError[];
};

function parseTrackInfo(text: string, line?: number): [TrackInfoNode | null, ParserError[]] {
    const errors: ParserError[] = [];
    
    // First check if it has a position bracket at the end
    const posMatch = text.match(/\[([^\]]+)\]$/);
    if (!posMatch) {
        errors.push({
            message: 'Invalid track info format',
            line,
            type: 'syntax'
        });
        return [null, errors];
    }

    const position = parseInt(posMatch[1], 10);
    if (isNaN(position)) {
        errors.push({
            message: 'Invalid track position',
            line,
            type: 'validation'
        });
        return [null, errors];
    }

    // Now parse the rest of the track info
    const trackText = text.slice(0, text.lastIndexOf('[')).trim();
    const match = trackText.match(/^(.+?)(?:\s*-\s*(.+?))?(?:\s*\((.+?)\))?$/);
    
    if (!match) {
        errors.push({
            message: 'Invalid track info format',
            line,
            type: 'syntax'
        });
        return [null, errors];
    }

    const [, title, artist = "", album = ""] = match;

    return [{
        type: 'track_info',
        title: title.trim(),
        artist: artist.trim(),
        album: album.trim() || undefined,
        position,
        images: []
    }, errors];
}

function convertInlineNode(node: BaseMarkdownNode): [InlineNode, ParserError[]] {
    const errors: ParserError[] = [];
    
    if (node.type === 'text') {
        return [{
            type: 'text',
            value: node.content
        }, errors];
    } else if (node.type === 'link') {
        if (!node.metadata?.url) {
            errors.push({
                message: 'Link missing URL',
                line: node.metadata?.position?.line,
                type: 'validation'
            });
        }
        return [{
            type: 'link',
            url: node.metadata?.url || '',
            children: [{ type: 'text', value: node.content }]
        }, errors];
    }
    
    // Default to text node for unsupported types
    errors.push({
        message: `Unsupported inline node type: ${node.type}`,
        line: node.metadata?.position?.line,
        type: 'structure'
    });
    
    return [{
        type: 'text',
        value: node.content
    }, errors];
}

function convertHeaderLevel(type: string): [HeaderNode['level'], ParserError[]] {
    const errors: ParserError[] = [];
    const level = parseInt(type.replace('header', ''), 10);
    
    if (level < 1 || level > 6) {
        errors.push({
            message: `Invalid header level: ${level}`,
            type: 'validation'
        });
        return [1, errors]; // Default to h1 if invalid
    }
    
    return [level as HeaderNode['level'], errors];
}

export function parseMarkdown(markdown: string): ParseResult {
    const parser = new MarkdownParser();
    let document: BaseMarkdownNode;
    
    try {
        document = parser.parse(markdown) as BaseMarkdownNode;
    } catch (error) {
        // Handle parser errors gracefully
        return {
            nodes: [],
            tracks: [],
            errors: [{
                message: error instanceof Error ? error.message : 'Unknown parsing error',
                type: 'syntax'
            }]
        };
    }
    
    const nodes: Node[] = [];
    const tracks: TrackInfoNode[] = [];
    const errors: ParserError[] = [];
    let currentTrack: TrackInfoNode | null = null;

    function processNode(node: BaseMarkdownNode): Node | null {
        if (node.type.startsWith('header')) {
            const [level, headerErrors] = convertHeaderLevel(node.type);
            errors.push(...headerErrors);
            
            if (level === 4) {
                const [trackInfo, trackErrors] = parseTrackInfo(node.content, node.metadata?.position?.line);
                errors.push(...trackErrors);
                
                if (trackInfo) {
                    if (currentTrack) {
                        tracks.push(currentTrack);
                    }
                    currentTrack = trackInfo;
                    return trackInfo;
                }
            }

            const inlineNodes: InlineNode[] = [];
            for (const child of node.children || []) {
                const [inlineNode, inlineErrors] = convertInlineNode(child);
                inlineNodes.push(inlineNode);
                errors.push(...inlineErrors);
            }

            return {
                type: 'header',
                level,
                children: inlineNodes
            };
        }

        if (node.type === 'paragraph') {
            if (node.children?.length === 1 && node.children[0].type === 'image') {
                const imageNode = node.children[0];
                if (currentTrack) {
                    if (!imageNode.metadata?.url) {
                        errors.push({
                            message: 'Image missing URL',
                            line: imageNode.metadata?.position?.line,
                            type: 'validation'
                        });
                    }
                    
                    const image: ImageNode = {
                        type: 'image',
                        src: imageNode.metadata?.url || '',
                        alt: imageNode.metadata?.alt || '',
                        position: currentTrack.position
                    };
                    currentTrack.images = currentTrack.images || [];
                    currentTrack.images.push(image);
                }
                return null;
            }

            const inlineNodes: InlineNode[] = [];
            for (const child of node.children || []) {
                const [inlineNode, inlineErrors] = convertInlineNode(child);
                inlineNodes.push(inlineNode);
                errors.push(...inlineErrors);
            }

            return {
                type: 'paragraph',
                children: inlineNodes,
                position: currentTrack?.position,
                hasTrack: !!currentTrack
            };
        }

        errors.push({
            message: `Unsupported node type: ${node.type}`,
            line: node.metadata?.position?.line,
            type: 'structure'
        });

        // Default case - convert to paragraph
        return {
            type: 'paragraph',
            children: [{ type: 'text', value: node.content }],
            position: currentTrack?.position,
            hasTrack: !!currentTrack
        };
    }

    // Process all nodes
    for (const child of document.children || []) {
        const processedNode = processNode(child);
        if (processedNode) {
            nodes.push(processedNode);
        }
    }

    // Add the last track if exists
    if (currentTrack) {
        tracks.push(currentTrack);
    }

    return { nodes, tracks, errors };
}