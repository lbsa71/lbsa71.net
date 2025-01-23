import { useEffect, useRef } from "react";
import { TrackNode } from "../types/core";

type MediaItemProps = {
  href: string;
  mediaUrl: string;
  className?: string;
  onEnded?: () => void;
  play?: boolean;
  trackData?: TrackNode[];
  onTrackChange?: (index: number) => void;
};

const MediaItem = ({
  href,
  mediaUrl,
  className,
  onEnded,
  play,
  trackData,
  onTrackChange,
}: MediaItemProps) => {
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement>(null);

  useEffect(() => {
    if (play && mediaRef.current) {
      void mediaRef.current.play();
    }
  }, [play]);

  const fullUrl = href.startsWith("http") ? href : `${mediaUrl}/${href}`;
  const isAudio = fullUrl.match(/\.(mp3|wav|m4a)$/i);
  const isVideo = fullUrl.match(/\.(mp4|webm|ogg)$/i);

  if (isAudio) {
    return (
      <audio
        ref={mediaRef as React.RefObject<HTMLAudioElement>}
        controls
        onEnded={onEnded}
        className={className}
      >
        <source src={fullUrl} type="audio/mpeg" />
      </audio>
    );
  }

  if (isVideo) {
    return (
      <video
        ref={mediaRef as React.RefObject<HTMLVideoElement>}
        controls
        onEnded={onEnded}
        className={className}
      >
        <source src={fullUrl} type="video/mp4" />
      </video>
    );
  }

  return (
    <img
      src={fullUrl}
      alt=""
      className={className}
    />
  );
};

export default MediaItem;
