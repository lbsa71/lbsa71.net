import React, { useRef } from "react";
import { ContentDocument, Site } from "../lib/getSite";
import styles from "../styles/content-document.module.css";
import { DocumentProvider } from "../context/DocumentContext";
import { useRouter } from "next/router";
import { safe } from "../lib/safe";
import { useAudio } from "../context/AudioContext";
import { parseMarkdown } from "../lib/markdownParser";
import { MediaPanel } from "./document-renderer/MediaPanel";
import { DocumentPanel } from "./document-renderer/DocumentPanel";
import { useTrackManagement } from "./document-renderer/useTrackManagement";

export const DocumentRenderer: React.FC<{
  site: Site;
  document: string | ContentDocument;
  documents: ContentDocument[];
}> = ({ site, document, documents }) => {
  const router = useRouter();
  const { currentTime, duration } = useAudio();
  const highlightedRef = useRef<HTMLParagraphElement>(null);
  const play = "play" in router.query;

  let contentDocument: ContentDocument;
  if (typeof document === "string") {
    const doc = documents.find((doc) => doc.document_id === document);
    if (!doc) {
      throw new Error(`Document not found: ${document}`);
    }
    contentDocument = doc;
  } else {
    contentDocument = document;
  }

  const { document_id, user_id, content, hero_img, media_item, playlist } = contentDocument;
  const { media_url } = site;

  const playListItems = documents
    .filter((doc) => doc.playlist === playlist)
    .sort((a: ContentDocument, b: ContentDocument) => {
      return safe(a.ordinal).localeCompare(b.ordinal, undefined, {
        numeric: true,
      });
    });

  const { currentTrack, tracks, onAudioEnd, onTrackChange } = useTrackManagement({
    content,
    document_id,
    playListItems,
    duration,
    currentTime,
  });

  // Auto-scroll effect
  React.useEffect(() => {
    if (highlightedRef.current) {
      highlightedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentTrack]);

  // Parse the markdown content
  const parsedContent = parseMarkdown(content);
  const mediaPanel = !!media_item || !!hero_img || !!playlist;

  return (
    <DocumentProvider value={{ user_id, document_id }}>
      <div className={styles["content-document-container"]}>
        {mediaPanel && (
          <MediaPanel
            hero_img={hero_img}
            media_item={media_item}
            media_url={media_url}
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
          media_url={media_url}
          currentTrack={currentTrack}
          highlightedRef={highlightedRef}
        />
      </div>
    </DocumentProvider>
  );
};
