import React from "react";
import styles from "../../styles/content-document.module.css";
import MediaItem from "../MediaItem";
import { Slideshow } from "../Slideshow";
import { ContentDocument } from "../../lib/getSite";
import { TrackInfo } from "../document-renderer/types";

interface MediaPanelProps {
  hero_img?: string;
  media_item?: string;
  media_url: string;
  playlist?: string;
  currentTrack: TrackInfo | null;
  playListItems: ContentDocument[];
  play?: boolean;
  tracks: TrackInfo[];
  onAudioEnd: () => void;
  onTrackChange: (index: number) => void;
}

export const MediaPanel: React.FC<MediaPanelProps> = ({
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
}) => {
  const hero_href = hero_img && hero_img.startsWith("http") ? hero_img : `${media_url}/${hero_img}`;

  return (
    <div className={styles["media-panel"]}>
      {hero_img && (
        <MediaItem
          media_url={media_url}
          href={hero_href}
          className={styles["media-image"]}
        />
      )}
      {media_item && (
        <div className={styles["media-container"]}>
          <MediaItem
            media_url={media_url}
            href={media_item}
            onEnded={onAudioEnd}
            play={!!play}
            trackData={tracks}
            onTrackChange={onTrackChange}
          />
        </div>
      )}
      {currentTrack?.images && currentTrack.images.length > 0 && (
        <div className={styles["slideshow-container"]}>
          <Slideshow 
            images={currentTrack.images}
            media_url={media_url}
          />
        </div>
      )}
      {playlist && (
        <div className={styles["playlist"]}>
          {playListItems.map((item) => (
            <ul key={item.document_id}>
              <a
                href={`/read/${item.document_id}`}
                className={styles["playlist-item"]}
              >
                {item.title}
              </a>
            </ul>
          ))}
        </div>
      )}
    </div>
  );
};
