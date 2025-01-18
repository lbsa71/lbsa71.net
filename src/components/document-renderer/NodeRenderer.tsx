import React from "react";
import styles from "../../styles/content-document.module.css";
import MediaItem from "../MediaItem";
import { Node } from "../../lib/markdownParser";
import { TrackInfo } from "./types";

interface NodeRendererProps {
  node: Node;
  media_url: string;
  currentTrack: TrackInfo | null;
  highlightedRef: React.RefObject<HTMLParagraphElement>;
}

export const NodeRenderer: React.FC<NodeRendererProps> = ({
  node,
  media_url,
  currentTrack,
  highlightedRef,
}) => {
  switch (node.type) {
    case 'text':
      return <>{node.value}</>;
    case 'header':
      const HeaderTag = `h${node.level}` as keyof JSX.IntrinsicElements;
      return (
        <HeaderTag>
          {node.children.map((child: Node, index: number) => (
            <NodeRenderer
              key={index}
              node={child}
              media_url={media_url}
              currentTrack={currentTrack}
              highlightedRef={highlightedRef}
            />
          ))}
        </HeaderTag>
      );
    case 'paragraph':
      const isHighlighted = node.hasTrack && currentTrack && node.position === currentTrack.position;
      return (
        <p 
          ref={isHighlighted ? highlightedRef : null}
          className={isHighlighted ? styles['highlighted-paragraph'] : ''}
        >
          {node.children.map((child: Node, index: number) => (
            <NodeRenderer
              key={index}
              node={child}
              media_url={media_url}
              currentTrack={currentTrack}
              highlightedRef={highlightedRef}
            />
          ))}
        </p>
      );
    case 'link':
      return (
        <MediaItem href={node.url} media_url={media_url}>
          {node.children.map((child: Node, index: number) => (
            <NodeRenderer
              key={index}
              node={child}
              media_url={media_url}
              currentTrack={currentTrack}
              highlightedRef={highlightedRef}
            />
          ))}
        </MediaItem>
      );
    case 'track_info':
    case 'image':
      return null;
    default:
      return null;
  }
};
