import { RefObject } from "react";
import styles from "../../styles/content-document.module.css";
import { Node } from "../../lib/types";
import { TrackInfo } from "./types";
import { NodeRenderer } from "./NodeRenderer";

type DocumentPanelProps = {
  nodes: Node[];
  media_url: string;
  currentTrack: TrackInfo | null;
  highlightedRef: RefObject<HTMLParagraphElement>;
};

export const DocumentPanel = ({
  nodes,
  media_url,
  currentTrack,
  highlightedRef,
}: DocumentPanelProps) => (
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
