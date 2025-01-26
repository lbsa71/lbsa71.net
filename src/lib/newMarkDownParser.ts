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

function parseTrackInfo(text: string): TrackInfoNode | null {
    const match = text.match(/^(.+?)(?:\s*-\s*(.+?))?(?:\s*\((.+?)\))?\s*\[(\d+)\]$/);
    if (!match) return null;

    const [, title, artist = "", album = "", positionStr] = match;
    const position = parseInt(positionStr, 10);
    if (isNaN(position)) return null;

    return {
        type: 'track_info',
        title: title.trim(),
        artist: artist.trim(),
        album: album.trim() || undefined,
        position,
        images: []
    };
}

function convertInlineNode(node: BaseMarkdownNode): InlineNode {
    if (node.type === 'text') {
        return {
            type: 'text',
            value: node.content
        };
    } else if (node.type === 'link') {
        return {
            type: 'link',
            url: node.metadata?.url || '',
            children: [{ type: 'text', value: node.content }]
        };
    }
    
    // Default to text node for unsupported types
    return {
        type: 'text',
        value: node.content
    };
}

function convertHeaderLevel(type: string): HeaderNode['level'] {
    const level = parseInt(type.replace('header', ''), 10);
    return level as HeaderNode['level'];
}

export function parseMarkdown(markdown: string): ParsedDocument {
    const parser = new MarkdownParser();
    const document = parser.parse(markdown) as BaseMarkdownNode;
    
    const nodes: Node[] = [];
    const tracks: TrackInfoNode[] = [];
    let currentTrack: TrackInfoNode | null = null;

    function processNode(node: BaseMarkdownNode): Node | null {
        if (node.type.startsWith('header')) {
            const level = convertHeaderLevel(node.type);
            
            if (level === 4) {
                const trackInfo = parseTrackInfo(node.content);
                if (trackInfo) {
                    if (currentTrack) {
                        tracks.push(currentTrack);
                    }
                    currentTrack = trackInfo;
                    return trackInfo;
                }
            }

            return {
                type: 'header',
                level,
                children: node.children?.map(convertInlineNode) || []
            };
        }

        if (node.type === 'paragraph') {
            if (node.children?.length === 1 && node.children[0].type === 'image') {
                const imageNode = node.children[0];
                if (currentTrack) {
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

            return {
                type: 'paragraph',
                children: node.children?.map(convertInlineNode) || [],
                position: currentTrack?.position,
                hasTrack: !!currentTrack
            };
        }

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

    return { nodes, tracks };
}