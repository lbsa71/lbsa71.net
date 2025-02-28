import { useState, useEffect, HTMLAttributes } from "react";
import { AudioProvider, useAudio } from "../context/AudioContext";
import AudioPlayer from "./AudioPlayer";
import { ZoomableImage } from "./ZoomableImage";
import styles from "../styles/AudioPlayer.module.css";

type TrackInfo = {
  title: string;
  artist: string;
  album?: string;
  position: number;
};

type MediaItemProps = HTMLAttributes<HTMLDivElement> & {
  media_url: string;
  href: string;
  onEnded?: () => void;
  play?: boolean;
  trackData?: TrackInfo[];
  onTrackChange?: (index: number) => void;
};

type EmbedProps = {
  href: string;
};

const TrackDisplay = ({ trackData }: { trackData: TrackInfo[] }) => {
  const { currentTime, setCuePoints } = useAudio();
  const [currentTrack, setCurrentTrack] = useState<TrackInfo | null>(null);

  useEffect(() => {
    if (!Array.isArray(trackData) || trackData.length === 0) {
      console.warn('TrackDisplay - Invalid or empty trackData received');
      return;
    }

    const cuePoints = trackData
      .map(track => track.position)
      .filter((time): time is number =>
        typeof time === 'number' && !isNaN(time) && time >= 0
      );

    if (cuePoints.length > 0) {
      setCuePoints(cuePoints);
    } else {
      console.warn('TrackDisplay - No valid cue points generated from trackData');
    }
  }, [trackData, setCuePoints]);

  useEffect(() => {
    const newTrack = trackData.find((track, index) =>
      currentTime >= track.position &&
      (index === trackData.length - 1 || currentTime < trackData[index + 1].position)
    );

    if (newTrack && (!currentTrack || newTrack.title !== currentTrack.title)) {
      setCurrentTrack(newTrack);
    }
  }, [currentTime, trackData, currentTrack]);

  if (!currentTrack) return null;

  return (
    <div className={styles.trackInfo}>
      <p>Now playing: {currentTrack.artist} - <i>{currentTrack.title}</i></p>
    </div>
  );
};

const SpotifyEmbed = ({ href }: EmbedProps) => {
  const embedUrl = href.startsWith("https://open.spotify.com/embed")
    ? href
    : `https://open.spotify.com/embed/artist/${href.split("/").pop()}`;

  return (
    <iframe
      src={embedUrl}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      width="100%"
      height={360}
      frameBorder="0"
      allowFullScreen
      loading="lazy"
    />
  );
};

const YoutubeEmbed = ({ href }: EmbedProps) => {
  const embedUrl = href.startsWith("https://www.youtube.com/watch")
    ? `https://www.youtube.com/embed/${new URL(href).searchParams.get("v")}`
    : href;

  return (
    <iframe
      src={embedUrl}
      width="100%"
      height={360}
      title="YouTube video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  );
};

const MediaItem = ({
  children,
  media_url,
  href,
  onEnded,
  play: autoPlay = false,
  trackData,
  onTrackChange,
  className,
  ...props
}: MediaItemProps) => {
  if (typeof href !== "string") return null;

  if (href.startsWith("https://www.youtube.com")) {
    return <YoutubeEmbed href={href} />;
  }

  if (href.startsWith("https://open.spotify.com")) {
    return <SpotifyEmbed href={href} />;
  }

  const fullHref = href.startsWith("https:") || href.startsWith("http:")
    ? href
    : `${media_url}/${href}`;

  if (fullHref.endsWith(".wav") || fullHref.endsWith(".mp3")) {
    return (
      <AudioProvider src={fullHref}>
        <div className={className}>
          {trackData && <TrackDisplay trackData={trackData} />}
          <AudioPlayer onTrackChange={onTrackChange} />
        </div>
      </AudioProvider>
    );
  }

  if (fullHref.endsWith(".mp4")) {
    return (
      <div {...props}>
        <video controls src={fullHref} onEnded={onEnded} autoPlay={autoPlay} />
      </div>
    );
  }

  // Handle image files
  if (fullHref.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)) {
    return (
      <ZoomableImage
        src={href}
        media_url={media_url}
        className={className}
        alt={typeof children === 'string' ? children : ''}
      />
    );
  }

  return <a href={fullHref}>{children}</a>;
};

export default MediaItem;
