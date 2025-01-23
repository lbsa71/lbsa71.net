import React from "react";
import styles from "../../styles/content-document.module.css";
import MediaItem from "../MediaItem";
import { Slideshow } from "../Slideshow";
import { ContentDocument, TrackNode, MediaItem as MediaItemType } from "../../types/core";

type MediaPanelProps = {
  heroImage?: string;
  mediaItem?: string;
  mediaUrl: string;
  playlist?: string;
  currentTrack: TrackNode | null;
  playListItems: ContentDocument[];
  play?: boolean;
  tracks: TrackNode[];
  onAudioEnd: () => void;
  onTrackChange: (index: number) => void;
};

const hasMedia = (track: TrackNode | null): track is TrackNode & { media: MediaItemType[] } => 
  Boolean(track?.media && track.media.length > 0);

export const MediaPanel = ({
  heroImage,
  mediaItem,
  mediaUrl,
  playlist,
  currentTrack,
  playListItems,
  play,
  tracks,
  onAudioEnd,
  onTrackChange,
}: MediaPanelProps) => {
  const heroHref = heroImage?.startsWith("http") 
    ? heroImage 
    : heroImage ? `${mediaUrl}/${heroImage}` 
    : undefined;

  return (
    <div className={styles["media-panel"]}>
      {heroHref && (
        <div className={styles["media-image"]}>
          <MediaItem
            href={heroHref}
            mediaUrl={mediaUrl}
            className={styles["media-image"]}
          />
        </div>
      )}
      {mediaItem && (
        <div className={styles["media-container"]}>
          <MediaItem
            href={mediaItem}
            mediaUrl={mediaUrl}
            onEnded={onAudioEnd}
            play={Boolean(play)}
            trackData={tracks}
            onTrackChange={onTrackChange}
          />
        </div>
      )}
      {hasMedia(currentTrack) && (
        <div className={styles["slideshow-container"]}>
          <Slideshow 
            images={currentTrack.media}
            mediaUrl={mediaUrl}
          />
        </div>
      )}
      {playlist && playListItems.length > 0 && (
        <nav className={styles["playlist"]}>
          <ul>
            {playListItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`/read/${item.id}`}
                  className={styles["playlist-item"]}
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
};
