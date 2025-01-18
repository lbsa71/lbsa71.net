import React from "react";
import styles from "../../styles/content-document.module.css";
import { Node } from "../../lib/markdownParser";
import { TrackInfo } from "../document-renderer/types";
import { NodeRenderer } from "./NodeRenderer";

interface DocumentPanelProps {
  nodes: Node[];
  media_url: string;
  currentTrack: TrackInfo | null;
  highlightedRef: React.RefObject<HTMLParagraphElement>;
}

export const DocumentPanel: React.FC<DocumentPanelProps> = ({
  nodes,
  media_url,
  currentTrack,
  highlightedRef,
}) => {
  return (
    <div className={styles["document-panel"]}>
      <div className={styles["content-document"]}>
        {nodes.map((node, index) => (
          <NodeRenderer
            key={index}
            node={node}
            media_url={media_url}
            currentTrack={currentTrack}
            highlightedRef={highlightedRef}
          />
        ))}
      </div>
    </div>
  );
};
