import { parseMarkdown } from '../markdownParser';

describe('parseMarkdown', () => {
  describe('basic node parsing', () => {
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

    it('should parse multiple paragraphs', () => {
      const input = 'First paragraph\n\nSecond paragraph';
      const result = parseMarkdown(input);
      
      expect(result.nodes).toHaveLength(2);
      expect(result.nodes.every(node => node.type === 'paragraph')).toBe(true);
    });
  });

  describe('header parsing', () => {
    it('should parse headers of different levels', () => {
      const input = '# H1\n## H2\n### H3\n#### Not Track\n##### H5\n###### H6';
      const result = parseMarkdown(input);
      
      expect(result.nodes).toHaveLength(6);
      expect(result.nodes.map(node => node.type === 'header' ? (node as any).level : null))
        .toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('should handle headers with inline content', () => {
      const input = '# Title with [link](http://example.com)';
      const result = parseMarkdown(input);
      
      expect(result.nodes[0]).toEqual({
        type: 'header',
        level: 1,
        children: [
          { type: 'text', value: 'Title with ' },
          { 
            type: 'link',
            url: 'http://example.com',
            children: [{ type: 'text', value: 'link' }]
          }
        ]
      });
    });
  });

  describe('track info parsing', () => {
    it('should parse track info from h4', () => {
      const input = '#### Song - Artist (Album) [1]';
      const result = parseMarkdown(input);
      
      expect(result.tracks).toHaveLength(1);
      expect(result.tracks[0]).toEqual({
        type: 'track_info',
        title: 'Song',
        artist: 'Artist',
        album: 'Album',
        position: 1,
        images: []
      });
    });

    it('should parse track info without album', () => {
      const input = '#### Song - Artist [2]';
      const result = parseMarkdown(input);
      
      expect(result.tracks[0]).toEqual({
        type: 'track_info',
        title: 'Song',
        artist: 'Artist',
        position: 2,
        images: []
      });
    });

    it('should associate images with tracks', () => {
      const input = '#### Song - Artist [1]\n![Cover](image.jpg)';
      const result = parseMarkdown(input);
      
      expect(result.tracks[0].images).toHaveLength(1);
      expect(result.tracks[0].images![0]).toEqual({
        type: 'image',
        src: 'image.jpg',
        alt: 'Cover',
        position: 1
      });
    });

    it('should set hasTrack on paragraphs after track info', () => {
      const input = '#### Song - Artist [1]\nSome text';
      const result = parseMarkdown(input);
      
      const paragraph = result.nodes.find(n => n.type === 'paragraph');
      expect(paragraph).toBeDefined();
      expect((paragraph as any).hasTrack).toBe(true);
      expect((paragraph as any).position).toBe(1);
    });
  });

  describe('link parsing', () => {
    it('should parse inline links', () => {
      const input = 'Text with [link](http://example.com) in it';
      const result = parseMarkdown(input);
      
      const paragraph = result.nodes[0] as any;
      expect(paragraph.children).toHaveLength(3);
      expect(paragraph.children[1]).toEqual({
        type: 'link',
        url: 'http://example.com',
        children: [{ type: 'text', value: 'link' }]
      });
    });

    it('should handle multiple links in one line', () => {
      const input = '[one](link1) and [two](link2)';
      const result = parseMarkdown(input);
      
      const children = (result.nodes[0] as any).children;
      expect(children.filter((c: any) => c.type === 'link')).toHaveLength(2);
    });

    it('should handle malformed links', () => {
      const input = 'Text with [broken link and [valid](http://example.com)';
      const result = parseMarkdown(input);
      
      const children = (result.nodes[0] as any).children;
      expect(children.filter((c: any) => c.type === 'link')).toHaveLength(1);
    });
  });

  describe('image parsing', () => {
    it('should not add standalone images to nodes array', () => {
      const input = '![Alt text](image.jpg)';
      const result = parseMarkdown(input);
      
      expect(result.nodes.find(n => n.type === 'image')).toBeUndefined();
    });

    it('should associate images with the previous track', () => {
      const input = '#### Song - Artist [1]\n![Cover](image.jpg)\n![Another](other.jpg)';
      const result = parseMarkdown(input);
      
      expect(result.tracks[0].images).toHaveLength(2);
      expect(result.tracks[0].images![0]).toEqual({
        type: 'image',
        src: 'image.jpg',
        alt: 'Cover',
        position: 1
      });
      expect(result.tracks[0].images![1]).toEqual({
        type: 'image',
        src: 'other.jpg',
        alt: 'Another',
        position: 1
      });
    });

    it('should ignore images with no preceding track', () => {
      const input = '![Cover](image.jpg)\n#### Song - Artist [1]';
      const result = parseMarkdown(input);
      
      expect(result.tracks[0].images).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty input', () => {
      const result = parseMarkdown('');
      expect(result.nodes).toHaveLength(0);
      expect(result.tracks).toHaveLength(0);
    });

    it('should handle input with only whitespace', () => {
      const result = parseMarkdown('   \n  \n  ');
      expect(result.nodes).toHaveLength(0);
      expect(result.tracks).toHaveLength(0);
    });

    it('should handle consecutive empty lines', () => {
      const result = parseMarkdown('Text\n\n\n\nMore text');
      expect(result.nodes).toHaveLength(2);
    });
  });
}); 