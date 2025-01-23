type NodeType = 'text' | 'header' | 'paragraph' | 'link' | 'track_info' | 'image';

type BaseNode = {
  type: NodeType;
};

type TextNode = BaseNode & {
  type: 'text';
  value: string;
};

type HeaderNode = BaseNode & {
  type: 'header';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: InlineNode[];
};

type ParagraphNode = BaseNode & {
  type: 'paragraph';
  children: InlineNode[];
  position?: number;
  hasTrack?: boolean;
};

type LinkNode = BaseNode & {
  type: 'link';
  url: string;
  children: TextNode[];
};

type ImageNode = BaseNode & {
  type: 'image';
  src: string;
  alt: string;
  position?: number;
};

type TrackInfoNode = BaseNode & {
  type: 'track_info';
  title: string;
  artist: string;
  album?: string;
  position: number;
  images?: ImageNode[];
};

export type Node = TextNode | HeaderNode | ParagraphNode | LinkNode | TrackInfoNode | ImageNode;
type InlineNode = TextNode | LinkNode;

type ParsedDocument = {
  nodes: Node[];
  tracks: TrackInfoNode[];
};

function parseInlineContent(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let currentText = '';
  let position = 0;

  while (position < text.length) {
    const linkStart = text.indexOf('[', position);
    
    if (linkStart === -1) {
      currentText += text.slice(position);
      break;
    }

    if (linkStart > position) {
      currentText += text.slice(position, linkStart);
    }

    const linkTextEnd = text.indexOf(']', linkStart);
    if (linkTextEnd === -1) {
      currentText += text.slice(position);
      break;
    }

    const linkUrlStart = text.indexOf('(', linkTextEnd);
    if (linkUrlStart === -1 || linkUrlStart !== linkTextEnd + 1) {
      currentText += text.slice(position, linkTextEnd + 1);
      position = linkTextEnd + 1;
      continue;
    }

    const linkUrlEnd = text.indexOf(')', linkUrlStart);
    if (linkUrlEnd === -1) {
      currentText += text.slice(position);
      break;
    }

    if (currentText) {
      nodes.push({
        type: 'text',
        value: currentText
      });
      currentText = '';
    }

    nodes.push({
      type: 'link',
      url: text.slice(linkUrlStart + 1, linkUrlEnd),
      children: [{
        type: 'text',
        value: text.slice(linkStart + 1, linkTextEnd)
      }]
    });

    position = linkUrlEnd + 1;
  }

  if (currentText) {
    nodes.push({
      type: 'text',
      value: currentText
    });
  }

  return nodes;
}

export function parseMarkdown(markdown: string): ParsedDocument {
  const lines = markdown.split('\n');
  const nodes: Node[] = [];
  const tracks: TrackInfoNode[] = [];
  let currentParagraph: string[] = [];
  let currentPosition: number | undefined;
  let hasCurrentTrack = false;
  let currentTrack: TrackInfoNode | null = null;

  function flushParagraph() {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join('\n');
      const inlineNodes = parseInlineContent(text);
      nodes.push({
        type: 'paragraph',
        children: inlineNodes,
        position: currentPosition,
        hasTrack: hasCurrentTrack
      });
      currentParagraph = [];
      currentPosition = undefined;
      hasCurrentTrack = false;
    }
  }

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

  function parseImage(text: string): ImageNode | null {
    const match = text.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    if (!match) return null;

    const [, alt, src] = match;
    return {
      type: 'image',
      src,
      alt,
      position: currentTrack?.position
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
        type: 'header',
        level,
        children: parseInlineContent(content)
      });
      continue;
    }

    const imageMatch = parseImage(trimmedLine);
    if (imageMatch) {
      if (currentTrack) {
        currentTrack.images = currentTrack.images || [];
        currentTrack.images.push(imageMatch);
      }
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
