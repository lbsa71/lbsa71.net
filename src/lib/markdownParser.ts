import { BaseNode, TextNode, HeaderNode, ParagraphNode, TrackNode, DocumentNode, MediaItem } from '../types/core';

type InlineNode = TextNode;

type ParsedDocument = {
  nodes: DocumentNode[];
  tracks: TrackNode[];
};

function parseInlineContent(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let currentText = '';
  let position = 0;

  while (position < text.length) {
    if (position < text.length) {
      nodes.push({
        id: `text-${position}`,
        type: 'text',
        content: text.slice(position)
      });
      break;
    }
  }

  return nodes;
}

export function parseMarkdown(markdown: string): ParsedDocument {
  const lines = markdown.split('\n');
  const nodes: DocumentNode[] = [];
  const tracks: TrackNode[] = [];
  let currentParagraph: string[] = [];
  let currentPosition: number | undefined;
  let hasCurrentTrack = false;
  let currentTrack: TrackNode | null = null;

  function flushParagraph() {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join('\n');
      nodes.push({
        id: `p-${nodes.length}`,
        type: 'paragraph',
        content: text,
        position: currentPosition,
        hasTrack: hasCurrentTrack
      });
      currentParagraph = [];
      currentPosition = undefined;
      hasCurrentTrack = false;
    }
  }

  function parseTrackInfo(text: string): TrackNode | null {
    const match = text.match(/^(.+?)(?:\s*-\s*(.+?))?(?:\s*\((.+?)\))?\s*\[(\d+)\]$/);
    if (!match) return null;

    const [, title, artist = "", album = "", positionStr] = match;
    const position = parseInt(positionStr, 10);
    if (isNaN(position)) return null;

    return {
      id: `track-${position}`,
      type: 'track',
      title: title.trim(),
      artist: artist.trim(),
      album: album.trim() || undefined,
      position,
      media: []
    };
  }

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) {
      flushParagraph();
      continue;
    }

    if (trimmedLine.startsWith('#')) {
      flushParagraph();
      const headerMatch = trimmedLine.match(/^(#+)/);
      if (!headerMatch) continue;
      
      const level = headerMatch[0].length as HeaderNode['level'];
      if (level < 1 || level > 6) continue;

      const content = trimmedLine.slice(level).trim();
      
      if (level === 4) {
        const trackInfo = parseTrackInfo(content);
        if (trackInfo) {
          if (currentTrack) {
            tracks.push(currentTrack);
          }
          currentTrack = trackInfo;
          nodes.push(trackInfo);
          currentPosition = trackInfo.position;
          hasCurrentTrack = true;
          continue;
        }
      }

      nodes.push({
        id: `h${level}-${nodes.length}`,
        type: 'header',
        level,
        content
      });
      continue;
    }

    currentParagraph.push(trimmedLine);
  }

  flushParagraph();
  if (currentTrack) {
    tracks.push(currentTrack);
  }

  return { nodes, tracks };
}
