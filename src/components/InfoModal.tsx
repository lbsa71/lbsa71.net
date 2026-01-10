import { useState, useEffect } from "react";
import { parseMarkdown } from "../lib/newMarkDownParser";
import { NodeRenderer } from "./document-renderer/NodeRenderer";
import styles from "../styles/content-document.module.css";

type InfoModalProps = {
  info: string;
  media_url: string;
  isOpen: boolean;
  onClose: () => void;
};

export const InfoModal = ({ info, media_url, isOpen, onClose }: InfoModalProps) => {
  const [parsedContent, setParsedContent] = useState<ReturnType<typeof parseMarkdown> | null>(null);

  useEffect(() => {
    if (isOpen && info) {
      const parsed = parseMarkdown(info);
      setParsedContent(parsed);
    }
  }, [isOpen, info]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !info || !parsedContent) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'auto',
          padding: '30px',
          position: 'relative',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666',
            padding: '5px 10px',
            lineHeight: '1',
          }}
          aria-label="Close"
        >
          ×
        </button>
        <div className={styles["content-document"]}>
          {parsedContent.nodes.map((node, index) => (
            <NodeRenderer
              key={index}
              node={node}
              media_url={media_url}
              currentTrack={null}
              highlightedRef={{ current: null }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
