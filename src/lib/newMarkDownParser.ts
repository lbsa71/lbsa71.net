/*
TODO:
This is a new markdown parser that is based on the @lbsa71/markdown-parser library.
It should be able to parse the same markdown as src/lib/markdownParser.ts.

After implementing, the tests in src/lib/__tests__/newMarkdownParser.test.ts should pass.
*/

import { MarkdownParser } from "@lbsa71/markdown-parser";
import { ParsedDocument, Node, TrackInfoNode, ImageNode } from "./types";

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

function convertNode(node: any, currentTrack: TrackInfoNode | null): Node {
    switch (node.type) {
        case 'text':
            return {
                type: 'text',
                value: node.content
            };

        case 'header1':
        case 'header2':
        case 'header3':
        case 'header4':
        case 'header5':
        case 'header6': {
            const level = parseInt(node.type.replace('header', ''), 10) as 1 | 2 | 3 | 4 | 5 | 6;
            return {
                type: 'header',
                level,
                children: node.children?.map((child: any) => convertNode(child, currentTrack)) || []
            };
        }

        case 'paragraph':
            return {
                type: 'paragraph',
                children: node.children?.map((child: any) => convertNode(child, currentTrack)) || [],
                position: currentTrack?.position,
                hasTrack: !!currentTrack
            };

        case 'link':
            if (!node.metadata?.url) {
                throw new Error('Link missing URL');
            }
            return {
                type: 'link',
                url: node.metadata.url,
                children: [{ type: 'text', value: node.content }]
            };

        case 'image':
            if (!node.metadata?.url) {
                throw new Error('Image missing URL');
            }
            return {
                type: 'image',
                src: node.metadata.url,
                alt: node.metadata.alt || '',
                position: currentTrack?.position
            };

        case 'blockquote':
            return {
                type: 'blockquote',
                children: node.children?.map((child: any) => convertNode(child, currentTrack)) || []
            };

        case 'codeBlock':
            return {
                type: 'codeBlock',
                value: node.content,
                language: node.metadata?.language
            };

        case 'bold':
            return {
                type: 'bold',
                children: node.children?.map((child: any) => convertNode(child, currentTrack)) || []
            };

        case 'italic':
            return {
                type: 'italic',
                children: node.children?.map((child: any) => convertNode(child, currentTrack)) || []
            };

        case 'list':
            return {
                type: 'list',
                ordered: node.metadata?.listType === 'ordered',
                children: node.children?.map((child: any) => convertNode(child, currentTrack)) || []
            };

        case 'listItem':
            return {
                type: 'listItem',
                children: node.children?.map((child: any) => convertNode(child, currentTrack)) || []
            };

        default:
            return {
                type: 'paragraph',
                children: [{ 
                    type: 'text',
                    value: node.content || ''
                }],
                position: currentTrack?.position,
                hasTrack: !!currentTrack
            };
    }
}

export function parseMarkdown(markdown: string): ParseResult {
    const parser = new MarkdownParser();
    let document: any;
    
    try {
        document = parser.parse(markdown);
    } catch (error) {
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

    // Process all nodes
    for (const child of document.children || []) {
        try {
            if (child.type === 'header4') {
                const [trackInfo, trackErrors] = parseTrackInfo(child.content);
                errors.push(...trackErrors);
                if (trackInfo) {
                    if (currentTrack) {
                        tracks.push(currentTrack);
                    }
                    currentTrack = trackInfo;
                    nodes.push(currentTrack);
                    continue;
                }
            }

            // Handle images inside paragraphs
            if (child.type === 'paragraph' && child.children?.length === 1 && child.children[0].type === 'image') {
                const imageNode = child.children[0];
                if (!imageNode.metadata?.url) {
                    throw new Error('Image missing URL');
                }
                const convertedImage = {
                    type: 'image' as const,
                    src: imageNode.metadata.url,
                    alt: imageNode.metadata.alt || '',
                    position: currentTrack?.position
                };
                if (currentTrack) {
                    currentTrack.images = currentTrack.images || [];
                    currentTrack.images.push(convertedImage);
                }
                continue;
            }

            nodes.push(convertNode(child, currentTrack));
        } catch (error) {
            errors.push({
                message: error instanceof Error ? error.message : 'Unknown error',
                type: 'validation'
            });
        }
    }

    // Add the last track if it exists and hasn't been added
    if (currentTrack && !tracks.includes(currentTrack)) {
        tracks.push(currentTrack);
    }

    return {
        nodes,
        tracks,
        errors
    };
}