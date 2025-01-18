interface BaseNode {
  type: string;
}

interface TextNode extends BaseNode {
  type: 'text';
  value: string;
}

interface HeaderNode extends BaseNode {
  type: 'header';
  level: number;
  children: Node[];
}

interface ParagraphNode extends BaseNode {
  type: 'paragraph';
  children: Node[];
  position?: number;
  hasTrack?: boolean;
}

interface LinkNode extends BaseNode {
  type: 'link';
  url: string;
  children: Node[];
}

interface ImageNode extends BaseNode {
  type: 'image';
  src: string;  // Changed from url to src to match Slideshow interface
  alt: string;
  position?: number;
}

interface TrackInfoNode extends BaseNode {
  type: 'track_info';
  title: string;
  artist: string;
  album?: string;
  position: number;
  images?: ImageNode[];
}

export type Node = TextNode | HeaderNode | ParagraphNode | LinkNode | TrackInfoNode | ImageNode;

interface ParsedDocument {
  nodes: Node[];
  tracks: TrackInfoNode[];
}

function parseInlineContent(text: string): (TextNode | LinkNode)[] {
  const nodes: (TextNode | LinkNode)[] = [];
  let currentText = '';
  let position = 0;

  while (position < text.length) {
    const linkStart = text.indexOf('[', position);
    
    if (linkStart === -1) {
      // No more links, add remaining text
      currentText += text.slice(position);
      break;
    }

    // Add text before the link
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

    // Add accumulated text if any
    if (currentText) {
      nodes.push({
        type: 'text',
        value: currentText
      });
      currentText = '';
    }

    // Add the link
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

  // Add any remaining text
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
    if (match) {
      const [, title, artist = "", album = "", position] = match;
      return {
        type: 'track_info',
        title: title.trim(),
        artist: artist.trim(),
        album: album.trim() || undefined,
        position: parseInt(position, 10),
        images: []
      };
    }
    return null;
  }

  function parseImage(text: string): ImageNode | null {
    const match = text.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    if (match) {
      return {
        type: 'image',
        src: match[2],  // Changed from url to src
        alt: match[1],
        position: currentTrack?.position
      };
    }
    return null;
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
      
      const level = headerMatch[0].length;
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
