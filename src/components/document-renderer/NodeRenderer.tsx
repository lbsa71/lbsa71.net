import { RefObject } from "react";
import styles from "../../styles/content-document.module.css";
import MediaItem from "../MediaItem";
import { Node } from "../../lib/types";
import { TrackInfo } from "./types";

type NodeRendererProps = {
  node: Node;
  media_url: string;
  currentTrack: TrackInfo | null;
  highlightedRef: RefObject<HTMLParagraphElement>;
};

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
      const HeaderTag = `h${node.level}` as keyof JSX.IntrinsicElements;
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

    case 'blockquote':
      return (
        <blockquote className={styles.blockquote}>
          {node.children.map((child, index) => (
            <div key={index}>
              {renderChildren({ node: { ...node, children: [child] }, media_url, currentTrack, highlightedRef })}
            </div>
          ))}
        </blockquote>
      );

    case 'codeBlock':
      return (
        <pre className={styles.codeBlock}>
          <code className={node.language ? `language-${node.language}` : undefined}>
            {node.value}
          </code>
        </pre>
      );

    case 'bold':
      return (
        <strong>
          {renderChildren({ node, media_url, currentTrack, highlightedRef })}
        </strong>
      );

    case 'italic':
      return (
        <em>
          {renderChildren({ node, media_url, currentTrack, highlightedRef })}
        </em>
      );

    case 'list': {
      const ListTag = node.ordered ? 'ol' : 'ul';
      return (
        <ListTag className={styles.list}>
          {renderChildren({ node, media_url, currentTrack, highlightedRef })}
        </ListTag>
      );
    }

    case 'listItem':
      return (
        <li>
          {renderChildren({ node, media_url, currentTrack, highlightedRef })}
        </li>
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
