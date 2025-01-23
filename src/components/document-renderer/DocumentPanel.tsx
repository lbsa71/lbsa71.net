import { RefObject } from "react";
import styles from "../../styles/content-document.module.css";
import { DocumentNode, TrackNode } from "../../types/core";
import { NodeRenderer } from "./NodeRenderer";

type DocumentPanelProps = {
  nodes: DocumentNode[];
  mediaUrl: string;
  currentTrack: TrackNode | null;
  highlightedRef: RefObject<HTMLParagraphElement>;
};

export const DocumentPanel = ({
  nodes,
  mediaUrl,
  currentTrack,
  highlightedRef,
}: DocumentPanelProps) => (
  <div className={styles["document-panel"]}>
    <div className={styles["content-document"]}>
      {nodes.map((node, index) => (
        <NodeRenderer
          key={index}
          node={node}
          mediaUrl={mediaUrl}
          currentTrack={currentTrack}
          highlightedRef={highlightedRef}
        />
      ))}
    </div>
  </div>
);
