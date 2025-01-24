import { RefObject } from "react";
import styles from "../../styles/content-document.module.css";
import MediaItem from "../MediaItem";
import { DocumentNode, TrackNode } from "../../types/core";

type NodeRendererProps = {
  node: DocumentNode;
  media_url: string;
  currentTrack: TrackNode | null;
  highlightedRef: RefObject<HTMLParagraphElement>;
};

type HeaderLevel = 1 | 2 | 3 | 4 | 5 | 6;

const hasChildren = (node: DocumentNode): node is DocumentNode & { children: DocumentNode[] } =>
  'children' in node && Array.isArray(node.children);

const renderChildren = (props: NodeRendererProps) => {
  if (!hasChildren(props.node)) return null;
  
  return (
    <>
      {props.node.children.map((child: DocumentNode, index: number) => (
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
      return <>{node.content}</>;

    case 'header': {
      const HeaderTag = `h${node.level as HeaderLevel}` as keyof JSX.IntrinsicElements;
      return (
        <HeaderTag>
          {node.content}
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
          {node.content}
        </p>
      );
    }

    case 'track':
      return null;

    default: {
      const _exhaustiveCheck: never = node;
      return null;
    }
  }
};
