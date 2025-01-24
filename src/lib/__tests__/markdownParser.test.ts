import { parseMarkdown } from '../markdownParser';

describe('parseMarkdown', () => {
  it('should parse basic text into a paragraph node', () => {
    const input = 'Hello world';
    const result = parseMarkdown(input);
    
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0]).toEqual({
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: 'Hello world'
        }
      ],
      position: undefined,
      hasTrack: false
    });
  });

  it('should parse headers correctly', () => {
    const input = '# Main Title\n## Subtitle';
    const result = parseMarkdown(input);
    
    expect(result.nodes).toHaveLength(2);
    expect(result.nodes[0]).toEqual({
      type: 'header',
      level: 1,
      children: [
        {
          type: 'text',
          value: 'Main Title'
        }
      ]
    });
    expect(result.nodes[1]).toEqual({
      type: 'header',
      level: 2,
      children: [
        {
          type: 'text',
          value: 'Subtitle'
        }
      ]
    });
  });

  it('should parse track info correctly', () => {
    const input = '#### Song Title - Artist (Album) [1]';
    const result = parseMarkdown(input);
    
    expect(result.nodes).toHaveLength(1);
    expect(result.tracks).toHaveLength(1);
    expect(result.tracks[0]).toEqual({
      type: 'track_info',
      title: 'Song Title',
      artist: 'Artist',
      album: 'Album',
      position: 1,
      images: []
    });
  });
}); 