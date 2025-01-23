import { useRef, useEffect } from "react";
import { Site, ContentDocument } from "../types/core";
import styles from "../styles/content-document.module.css";
import { DocumentProvider } from "../context/DocumentContext";
import { useRouter } from "next/router";
import { safe } from "../lib/safe";
import { useAudio } from "../context/AudioContext";
import { parseMarkdown } from "../lib/markdownParser";
import { MediaPanel } from "./document-renderer/MediaPanel";
import { DocumentPanel } from "./document-renderer/DocumentPanel";
import { useTrackManagement } from "./document-renderer/useTrackManagement";

type DocumentRendererProps = {
  site: Site;
  document: string | ContentDocument;
  documents: ContentDocument[];
};

export const DocumentRenderer = ({ site, document, documents }: DocumentRendererProps) => {
  const router = useRouter();
  const { currentTime, duration } = useAudio();
  const highlightedRef = useRef<HTMLParagraphElement>(null);
  const play = "play" in router.query;

  const contentDocument = typeof document === "string"
    ? documents.find((doc) => doc.id === document) ?? 
      (() => { throw new Error(`Document not found: ${document}`) })()
    : document;

  const { id, userId, content, heroImage, mediaItem, playlist } = contentDocument;
  const { mediaUrl } = site;

  const playListItems = documents
    .filter((doc) => doc.playlist === playlist)
    .sort((a, b) => {
      const ordinalA = a.ordinal ?? '';
      const ordinalB = b.ordinal ?? '';
      return ordinalA.localeCompare(ordinalB, undefined, { numeric: true });
    });

  const { currentTrack, tracks, onAudioEnd, onTrackChange } = useTrackManagement({
    content,
    documentId: id,
    playListItems,
    duration,
    currentTime,
  });

  useEffect(() => {
    if (highlightedRef.current) {
      highlightedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentTrack]);

  const parsedContent = parseMarkdown(content);
  const mediaPanel = Boolean(mediaItem || heroImage || playlist);

  return (
    <DocumentProvider value={{ userId, documentId: id }}>
      <div className={styles["content-document-container"]}>
        {mediaPanel && (
          <MediaPanel
            heroImage={heroImage}
            mediaItem={mediaItem}
            mediaUrl={mediaUrl}
            playlist={playlist}
            currentTrack={currentTrack}
            playListItems={playListItems}
            play={play}
            tracks={tracks}
            onAudioEnd={onAudioEnd}
            onTrackChange={onTrackChange}
          />
        )}
        <DocumentPanel
          nodes={parsedContent.nodes}
          mediaUrl={mediaUrl}
          currentTrack={currentTrack}
          highlightedRef={highlightedRef}
        />
      </div>
    </DocumentProvider>
  );
};
