import { RefObject } from "react";
import styles from "../../styles/content-document.module.css";
import MediaItem from "../MediaItem";
import { Node } from "../../lib/markdownParser";
import { TrackInfo } from "./types";

type NodeRendererProps = {
  node: Node;
  media_url: string;
  currentTrack: TrackInfo | null;
  highlightedRef: RefObject<HTMLParagraphElement>;
};

type HeaderLevel = 1 | 2 | 3 | 4 | 5 | 6;

const hasChildren = (node: Node): node is Node & { children: Node[] } =>
  'children' in node && Array.isArray(node.children);

const renderChildren = (props: NodeRendererProps) => {
  if (!hasChildren(props.node)) return null;
  
  return (
    <>
      {props.node.children.map((child: Node, index: number) => (
        <NodeRenderer
          key={index}
          {...props}
          node={child}
        />
      ))}
    </>
  );
};

export const NodeRenderer = ({
  node,
  media_url,
  currentTrack,
  highlightedRef,
}: NodeRendererProps) => {
  switch (node.type) {
    case 'text':
      return <>{node.value}</>;

    case 'header': {
      const HeaderTag = `h${node.level as HeaderLevel}` as keyof JSX.IntrinsicElements;
      return (
        <HeaderTag>
          {renderChildren({ node, media_url, currentTrack, highlightedRef })}
        </HeaderTag>
      );
    }

    case 'paragraph': {
      const isHighlighted = node.hasTrack && 
        currentTrack?.position !== undefined && 
        node.position === currentTrack.position;

      return (
        <p 
          ref={isHighlighted ? highlightedRef : null}
          className={isHighlighted ? styles['highlighted-paragraph'] : undefined}
        >
          {renderChildren({ node, media_url, currentTrack, highlightedRef })}
        </p>
      );
    }

    case 'link':
      return (
        <MediaItem href={node.url} media_url={media_url}>
          {renderChildren({ node, media_url, currentTrack, highlightedRef })}
        </MediaItem>
      );

    case 'track_info':
    case 'image':
      return null;

    default: {
      const _exhaustiveCheck: never = node;
      return null;
    }
  }
};
