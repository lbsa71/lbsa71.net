import React from "react";
import styles from "../../styles/content-document.module.css";
import MediaItem from "../MediaItem";
import { Slideshow } from "../Slideshow";
import { ContentDocument, TrackNode, MediaItem as MediaItemType } from "../../types/core";

type MediaPanelProps = {
  hero_img?: string;
  media_item?: string;
  media_url: string;
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
  hero_img,
  media_item,
  media_url,
  playlist,
  currentTrack,
  playListItems,
  play,
  tracks,
  onAudioEnd,
  onTrackChange,
}: MediaPanelProps) => {
  const heroHref = hero_img?.startsWith("http") 
    ? hero_img 
    : hero_img ? `${media_url}/${hero_img}` 
    : undefined;

  return (
    <div className={styles["media-panel"]}>
      {heroHref && (
        <div className={styles["media-image"]}>
          <MediaItem
            href={heroHref}
            media_url={media_url}
            className={styles["media-image"]}
          />
        </div>
      )}
      {media_item && (
        <div className={styles["media-container"]}>
          <MediaItem
            href={media_item}
            media_url={media_url}
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
            media_url={media_url}
          />
        </div>
      )}
      {playlist && playListItems.length > 0 && (
        <nav className={styles["playlist"]}>
          <ul>
            {playListItems.map((item) => (
              <li key={item.document_id}>
                <a
                  href={`/read/${item.document_id}`}
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
