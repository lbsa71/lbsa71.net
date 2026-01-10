import React from "react";
import styles from "../../styles/content-document.module.css";
import MediaItem from "../MediaItem";
import { Slideshow } from "../Slideshow";
import { ContentDocument } from "../../lib/getSite";
import { TrackInfo, ImageInfo } from "./types";
import { withBasePath } from "../../lib/paths";

type MediaPanelProps = {
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
};

const hasImages = (track: TrackInfo | null): track is TrackInfo & { images: ImageInfo[] } =>
  Boolean(track?.images && track.images.length > 0);

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
  return (
    <div className={styles["media-panel"]}>
      {hero_img && (
        <MediaItem
          media_url={media_url}
          href={hero_img}
          className={styles["media-image"]}
        />
      )}
      {media_item && (
        <div className={styles["media-container"]}>
          <MediaItem
            media_url={media_url}
            href={media_item}
            onEnded={onAudioEnd}
            play={Boolean(play)}
            trackData={tracks}
            onTrackChange={onTrackChange}
          />
        </div>
      )}
      {hasImages(currentTrack) && (
        <div className={styles["slideshow-container"]}>
          <Slideshow
            images={currentTrack.images}
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
                  href={withBasePath(`/read/${item.document_id}`)}
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
